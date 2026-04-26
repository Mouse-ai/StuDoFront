import { useState, useEffect, useRef } from 'react';
import { apiFetch, getAiKey, getAiModel, logAiRequest } from '../api/client';
import type { Task } from '../types';
import { Send, X, Loader2, Check, X as XIcon, Bot, ChevronRight } from 'lucide-react';

interface AIMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	steps?: { type: 'info' | 'success' | 'confirm'; text: string }[];
}

interface PendingAIAction {
	toolCallId: string;
	name: string;
	args: any;
	description: string;
}

const AI_TOOLS = [
	{
		type: 'function' as const,
		function: {
			name: 'createTask',
			description: 'Создает новую учебную задачу',
			parameters: {
				type: 'object',
				properties: {
					title: { type: 'string', description: 'Название задачи' },
					subject: { type: 'string', description: 'Предмет' },
					deadline: { type: 'string', description: 'Дедлайн YYYY-MM-DD' }
				},
				required: ['title', 'subject', 'deadline']
			}
		}
	},
	{
		type: 'function' as const,
		function: {
			name: 'createSubtasks',
			description: 'Создает подзадачи для существующей задачи',
			parameters: {
				type: 'object',
				properties: {
					taskId: { type: 'string', description: 'UUID задачи' },
					subtasks: {
						type: 'array',
						items: {
							type: 'object',
							properties: { title: { type: 'string' }, isCompleted: { type: 'boolean' } },
							required: ['title']
						}
					}
				},
				required: ['taskId', 'subtasks']
			}
		}
	}
];

export function AiTaskCreator({ isOpen, onClose, onTaskCreated }: { isOpen: boolean; onClose: () => void; onTaskCreated: () => void }) {
	const [messages, setMessages] = useState<AIMessage[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [pendingAction, setPendingAction] = useState<PendingAIAction | null>(null);
	const [apiKey, setApiKey] = useState('');
	const [modelName, setModelName] = useState('meta-llama/llama-3.3-70b-instruct');
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Фиксация скролла и закрытие по Escape
	useEffect(() => {
		if (!isOpen) return;
		const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
		window.addEventListener('keydown', handleEsc);
		document.body.style.overflow = 'hidden';
		return () => {
			window.removeEventListener('keydown', handleEsc);
			document.body.style.overflow = '';
		};
	}, [isOpen, onClose]);

	// Инициализация при открытии
	useEffect(() => {
		if (isOpen && messages.length === 0) {
			fetchAiConfig();
			setMessages([{ id: crypto.randomUUID(), role: 'assistant', content: 'Привет! Опиши задачу, которую нужно создать, или попроси разбить тему на шаги. Я покажу план перед выполнением.' }]);
		}
	}, [isOpen]);

	// Автопрокрутка
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, pendingAction]);

	const fetchAiConfig = async () => {
		try { setApiKey(await getAiKey()); } catch { }
		try {
			const model = await getAiModel();
			if (model) setModelName(model);
		} catch { }
	};

	const handleSend = async () => {
		if (!input.trim() || loading || pendingAction) return;
		const userMsg: AIMessage = { id: crypto.randomUUID(), role: 'user', content: input };
		setMessages(prev => [...prev, userMsg]);
		setInput('');
		setLoading(true);

		const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

		try {
			const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'StuDo' },
				body: JSON.stringify({
					model: modelName,
					messages: [{ role: 'system', content: 'Ты ассистент по созданию учебных задач. Используй инструменты createTask и createSubtasks. Никогда не выполняй их без подтверждения. Описывай шаги кратко.' }, ...history],
					tools: AI_TOOLS,
					tool_choice: 'auto'
				})
			});
			const data = await res.json();
			const assistantMsg = data.choices?.[0]?.message;

			if (data.usage) {
				logAiRequest({ model: modelName, promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens, status: 'success' });
			}

			if (assistantMsg?.tool_calls?.length > 0) {
				const call = assistantMsg.tool_calls[0];
				const args = JSON.parse(call.function.arguments);
				const desc = call.function.name === 'createTask'
					? `Создать задачу "${args.title}" (${args.subject}) на ${args.deadline}?`
					: `Создать ${args.subtasks?.length || 0} подзадач для задачи ${args.taskId}?`;

				setPendingAction({ toolCallId: call.id, name: call.function.name, args, description: desc });
				setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: '', steps: [{ type: 'confirm', text: desc }] }]);
			} else {
				setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: assistantMsg?.content || 'Готово.' }]);
			}
		} catch (err: any) {
			logAiRequest({ model: modelName, status: 'error', errorMessage: err.message });
			setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Ошибка соединения с AI.' }]);
		} finally {
			setLoading(false);
		}
	};

	const executeAction = async (confirmed: boolean) => {
		if (!pendingAction) return;
		setLoading(true);
		let toolResult = 'Отменено пользователем.';
		const newSteps: AIMessage['steps'] = [];

		try {
			if (confirmed) {
				if (pendingAction.name === 'createTask') {
					await apiFetch<Task>('/api/Tasks', {
						method: 'POST',
						body: JSON.stringify({ id: crypto.randomUUID(), title: pendingAction.args.title, subject: pendingAction.args.subject, deadline: pendingAction.args.deadline, completed: false, chatHistory: [] })
					});
					toolResult = `Задача "${pendingAction.args.title}" успешно создана.`;
					newSteps.push({ type: 'success', text: toolResult });
					onTaskCreated();
				} else if (pendingAction.name === 'createSubtasks') {
					const createdCount = pendingAction.args.subtasks?.length || 0;
					for (const st of pendingAction.args.subtasks || []) {
						await apiFetch('/api/Subtasks', { method: 'POST', body: JSON.stringify({ taskId: pendingAction.args.taskId, title: st.title, isCompleted: st.isCompleted || false }) });
					}
					toolResult = `Создано ${createdCount} подзадач.`;
					newSteps.push({ type: 'success', text: toolResult });
				}
			}
		} catch {
			toolResult = 'Ошибка при выполнении запроса к серверу.';
			newSteps.push({ type: 'info', text: toolResult });
		}

		const historyWithTool = [
			...messages.map(m => ({ role: m.role, content: m.content })),
			{ role: 'assistant', tool_calls: [{ id: pendingAction.toolCallId, function: { name: pendingAction.name, arguments: JSON.stringify(pendingAction.args) } }] },
			{ role: 'tool', tool_call_id: pendingAction.toolCallId, content: toolResult }
		];

		try {
			const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'StuDo' },
				body: JSON.stringify({ model: modelName, messages: historyWithTool })
			});
			const data = await res.json();
			const reply = data.choices?.[0]?.message?.content || 'Выполнено.';

			if (data.usage) logAiRequest({ model: modelName, promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens, status: 'success' });

			setMessages(prev => [...prev.filter(m => !m.steps), { id: crypto.randomUUID(), role: 'assistant', content: reply, steps: newSteps }]);
		} catch (err: any) {
			logAiRequest({ model: modelName, status: 'error', errorMessage: err.message });
			setMessages(prev => [...prev.filter(m => !m.steps), { id: crypto.randomUUID(), role: 'assistant', content: 'Действие выполнено, но не удалось сформировать финальный ответ.', steps: newSteps }]);
		}

		setPendingAction(null);
		setLoading(false);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
			{/* Затемненный фон с закрытием по клику */}
			<div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

			{/* Само диалоговое окно */}
			<div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-enter">
				{/* Шапка */}
				<div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
					<div className="flex items-center gap-2">
						<Bot className="text-indigo-600" size={20} />
						<h3 className="font-bold text-gray-800">AI Конструктор Задач</h3>
					</div>
					<button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
						<X size={18} className="text-gray-500" />
					</button>
				</div>

				{/* Сообщения */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
					{messages.map(msg => (
						<div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
							<div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'}`}>
								{msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
								{msg.steps && (
									<div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
										{msg.steps.map((step, i) => (
											<div key={i} className={`flex items-center gap-2 text-xs font-medium ${step.type === 'success' ? 'text-green-600' : step.type === 'confirm' ? 'text-amber-600' : 'text-blue-600'}`}>
												{step.type === 'success' ? <Check size={12} /> : step.type === 'confirm' ? <ChevronRight size={12} /> : <Loader2 size={12} className="animate-spin" />}
												{step.text}
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>

				{/* Подтверждение действия */}
				{pendingAction && (
					<div className="p-4 bg-amber-50 border-t border-amber-100 shrink-0">
						<p className="text-sm font-medium text-amber-900 mb-3">⚠️ AI предлагает действие:</p>
						<p className="text-xs text-amber-800 mb-3 bg-white p-2 rounded-lg border border-amber-200">{pendingAction.description}</p>
						<div className="flex gap-2">
							<button onClick={() => executeAction(true)} disabled={loading} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-1 disabled:opacity-50">
								<Check size={14} /> Выполнить
							</button>
							<button onClick={() => executeAction(false)} disabled={loading} className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-1 disabled:opacity-50">
								<XIcon size={14} /> Отмена
							</button>
						</div>
					</div>
				)}

				{/* Поле ввода */}
				<div className="p-4 border-t border-gray-200 bg-white shrink-0">
					<div className="flex items-center gap-2">
						<input
							type="text"
							placeholder="Опишите задачу или план..."
							className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-300"
							value={input}
							onChange={e => setInput(e.target.value)}
							onKeyDown={e => e.key === 'Enter' && handleSend()}
							disabled={loading || !!pendingAction}
						/>
						<button onClick={handleSend} disabled={loading || !!pendingAction || !input.trim()} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition">
							{loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}