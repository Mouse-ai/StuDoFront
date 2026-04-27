import { useState, useEffect, useRef } from 'react';
import { apiFetch, getAiKey, getAiModel, createTask, createSubtask } from '../api/client';
import { Send, X, Loader2, Check, X as XIcon, Bot, ChevronRight } from 'lucide-react';
import type { Task } from '../types';

const AI_TOOLS = [
	{ type: 'function' as const, function: { name: 'createTask', description: 'Создает новую учебную задачу', parameters: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, deadline: { type: 'string' }, priority: { type: 'string' }, status: { type: 'string' } }, required: ['title', 'description', 'deadline', 'priority', 'status'] } } },
	{ type: 'function' as const, function: { name: 'createSubtask', description: 'Создает подзадачи', parameters: { type: 'object', properties: { taskId: { type: 'string' }, title: { type: 'string' } }, required: ['taskId', 'title'] } } }
];

export function AiTaskCreator({ isOpen, onClose, onTaskCreated }: { isOpen: boolean; onClose: () => void; onTaskCreated: () => void }) {
	const [messages, setMessages] = useState<{ id: string; role: string; content: string; steps?: { type: string; text: string }[] }[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [pendingAction, setPendingAction] = useState<{ toolCallId: string; name: string; args: any; description: string } | null>(null);
	const [apiKey, setApiKey] = useState('');
	const [modelName, setModelName] = useState('meta-llama/llama-3.3-70b-instruct');
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
		window.addEventListener('keydown', handleEsc);
		const w = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.overflow = 'hidden';
		document.body.style.paddingRight = `${w}px`;
		return () => { window.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; document.body.style.paddingRight = ''; };
	}, [isOpen, onClose]);

	useEffect(() => { if (isOpen && messages.length === 0) { fetchConfig(); setMessages([{ id: crypto.randomUUID(), role: 'assistant', content: 'Опиши задачу или план действий.' }]); } }, [isOpen]);
	useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, pendingAction]);

	const fetchConfig = async () => { try { setApiKey(await getAiKey()); } catch { } try { const m = await getAiModel(); if (m) setModelName(m); } catch { } };

	const handleSend = async () => {
		if (!input.trim() || loading || pendingAction) return;
		const userMsg = { id: crypto.randomUUID(), role: 'user', content: input };
		setMessages(prev => [...prev, userMsg]);
		setInput(''); setLoading(true);
		const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
		try {
			const res = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'StuDo' }, body: JSON.stringify({ model: modelName, messages: [{ role: 'system', content: 'Ассистент. Используй инструменты. Жди подтверждения.' }, ...history], tools: AI_TOOLS, tool_choice: 'auto' }) });
			const data = await res.json();
			const msg = data.choices?.[0]?.message;
			if (msg?.tool_calls?.length > 0) {
				const call = msg.tool_calls[0]; const args = JSON.parse(call.function.arguments);
				const desc = call.function.name === 'createTask' ? `Создать: "${args.title}" (до ${args.deadline})?` : `Добавить подзадачу "${args.title}"?`;
				setPendingAction({ toolCallId: call.id, name: call.function.name, args, description: desc });
				setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: '', steps: [{ type: 'confirm', text: desc }] }]);
			} else setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: msg?.content || 'Готово.' }]);
		} catch { setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Ошибка.' }]); }
		finally { setLoading(false); }
	};

	const execute = async (confirmed: boolean) => {
		if (!pendingAction) return;
		setLoading(true);
		let result = 'Отменено.';
		try {
			if (confirmed) {
				if (pendingAction.name === 'createTask') {
					await createTask(pendingAction.args); onTaskCreated(); result = 'Задача создана.';
				} else if (pendingAction.name === 'createSubtask') {
					await createSubtask({ id: crypto.randomUUID(), taskId: pendingAction.args.taskId, title: pendingAction.args.title, isCompleted: false, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); result = 'Подзадача добавлена.';
				}
			}
		} catch { result = 'Ошибка сервера.'; }
		setPendingAction(null); setLoading(false);
		setMessages(prev => [...prev.filter(m => !m.steps), { id: crypto.randomUUID(), role: 'assistant', content: result, steps: [{ type: confirmed ? 'success' : 'info', text: result }] }]);
	};

	if (!isOpen) return null;
	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
			<div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: 'dialogIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
				<div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0 bg-white"><div className="flex items-center gap-2"><Bot className="text-indigo-600" size={20} /><h3 className="font-bold text-gray-800">AI Конструктор</h3></div><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={18} className="text-gray-500" /></button></div>
				<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
					{messages.map(msg => (
						<div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
							<div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'}`}>
								{msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
								{msg.steps && msg.steps.map((step, i) => <div key={i} className={`mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs font-medium ${step.type === 'success' ? 'text-green-600' : 'text-amber-600'}`}><ChevronRight size={12} />{step.text}</div>)}
							</div>
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>
				{pendingAction && (
					<div className="p-4 bg-amber-50 border-t border-amber-100 shrink-0">
						<p className="text-sm font-medium text-amber-900 mb-3">⚠️ AI предлагает:</p>
						<p className="text-xs text-amber-800 mb-3 bg-white p-2 rounded-lg border border-amber-200">{pendingAction.description}</p>
						<div className="flex gap-2"><button onClick={() => execute(true)} disabled={loading} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"><Check size={14} /> Выполнить</button><button onClick={() => execute(false)} disabled={loading} className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"><XIcon size={14} /> Отмена</button></div>
					</div>
				)}
				<div className="p-4 border-t border-gray-200 bg-white shrink-0"><div className="flex items-center gap-2"><input type="text" placeholder="Опишите задачу..." className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} disabled={loading || !!pendingAction} /><button onClick={handleSend} disabled={loading || !!pendingAction || !input.trim()} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition">{loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button></div></div>
			</div>
			<style>{`@keyframes dialogIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
		</div>
	);
}