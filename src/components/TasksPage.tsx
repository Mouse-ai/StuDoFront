import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask, createSubtask, getTasks, deleteTask, getAiKey, getAiModel } from '../api/client';
import type { Task } from '../types';
import { Plus, Trash2, Calendar, Loader2, ArrowRight, AlertTriangle, Clock, Flag, Sparkles, Bot, Send, X, Check, ChevronLeft } from 'lucide-react';

export function TasksPage() {
	const navigate = useNavigate();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);

	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [drawerMode, setDrawerMode] = useState<'manual' | 'ai'>('manual');

	const [manualForm, setManualForm] = useState({ title: '', description: '', deadline: '', priority: 'medium' as 'low' | 'medium' | 'high' });
	const [manualLoading, setManualLoading] = useState(false);

	const [aiMessages, setAiMessages] = useState<{ id: string; role: string; content: string; proposal?: any }[]>([]);
	const [aiInput, setAiInput] = useState('');
	const [aiLoading, setAiLoading] = useState(false);
	const [pendingProposal, setPendingProposal] = useState<any>(null);
	const [apiKey, setApiKey] = useState('');
	const [modelName, setModelName] = useState('meta-llama/llama-3.3-70b-instruct');
	const aiEndRef = useRef<HTMLDivElement>(null);

	const AI_TOOLS = [
		{
			type: 'function' as const,
			function: {
				name: 'createTaskProposal',
				description: 'Используй этот инструмент ТОЛЬКО когда у тебя есть Название, Дедлайн, Приоритет и Подзадачи.',
				parameters: {
					type: 'object',
					properties: {
						title: { type: 'string' },
						description: { type: 'string' },
						deadline: { type: 'string' },
						priority: { type: 'string', enum: ['low', 'medium', 'high'] },
						subtasks: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' } }, required: ['title'] } }
					},
					required: ['title', 'deadline', 'priority', 'subtasks']
				}
			}
		}
	];

	const loadTasks = useCallback(async () => {
		try {
			const data = await getTasks();
			const list = Array.isArray(data) ? data : [];
			setTasks(list.filter(t => t.status !== 'cancelled'));
		} catch { setTasks([]); }
		finally { setLoading(false); }
	}, []);

	useEffect(() => { loadTasks(); }, [loadTasks]);

	// 🔹 Загружаем ключ и модель с сервера только при открытии AI-панели
	useEffect(() => {
		if (isDrawerOpen && drawerMode === 'ai' && aiMessages.length === 0) {
			Promise.allSettled([getAiKey(), getAiModel()]).then(([k, m]) => {
				if (k.status === 'fulfilled' && k.value) setApiKey(k.value);
				if (m.status === 'fulfilled' && m.value) setModelName(m.value);
			});
			setAiMessages([{ id: crypto.randomUUID(), role: 'assistant', content: 'Привет! Опиши задачу. Я соберу данные, сформирую план с подзадачами и создам её только после твоего подтверждения.' }]);
		}
	}, [isDrawerOpen, drawerMode]);

	useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMessages, pendingProposal]);
	useEffect(() => {
		if (isDrawerOpen) { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }
	}, [isDrawerOpen]);

	const openDrawer = (mode: 'manual' | 'ai') => { setDrawerMode(mode); setIsDrawerOpen(true); };
	const closeDrawer = () => {
		setIsDrawerOpen(false);
		if (drawerMode === 'manual') { setManualForm({ title: '', description: '', deadline: '', priority: 'medium' }); setManualLoading(false); }
		else { setAiMessages([]); setAiInput(''); setPendingProposal(null); setAiLoading(false); }
	};

	const handleManualSubmit = async (e: React.FormEvent) => {
		e.preventDefault(); setManualLoading(true);
		try {
			await createTask({ title: manualForm.title, description: manualForm.description || null, deadline: manualForm.deadline ? new Date(manualForm.deadline).toISOString() : null, priority: manualForm.priority, status: 'todo' });
			closeDrawer(); loadTasks();
		} catch (err) { console.error(err); }
		finally { setManualLoading(false); }
	};

	const handleAiSend = async () => {
		if (!aiInput.trim() || aiLoading || pendingProposal || !apiKey) return;
		const userMsg = { id: crypto.randomUUID(), role: 'user', content: aiInput };
		setAiMessages(prev => [...prev, userMsg]);
		setAiInput(''); setAiLoading(true);
		const history = [...aiMessages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMsg.content }];

		try {
			const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'StuDo' },
				body: JSON.stringify({
					model: modelName,
					messages: [
						{
							role: 'system',
							content: 'Ты ассистент по планированию задач. Отвечай на двух языках: 🇷🇺 RU / 🇬🇧 EN. Твоя цель — собрать данные (Название, Дедлайн, Приоритет, Подзадачи) и вызвать инструмент createTaskProposal. НЕ пиши "готово" или план текстом. Как только данные собраны, ты ОБЯЗАН вызвать инструмент.'
						},
						...history
					],
					tools: AI_TOOLS,
					tool_choice: 'auto'
				})
			});
			const data = await res.json();
			const msg = data.choices?.[0]?.message;

			if (msg?.tool_calls?.[0]) {
				const args = JSON.parse(msg.tool_calls[0].function.arguments);
				setPendingProposal(args);
				setAiMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: '', proposal: args }]);
			} else {
				setAiMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: msg?.content || 'Готово.' }]);
			}
		} catch {
			setAiMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Ошибка соединения с OpenRouter.' }]);
		} finally { setAiLoading(false); }
	};

	const executeProposal = async (confirm: boolean) => {
		if (!pendingProposal) return;
		setAiLoading(true);
		let resultMsg = confirm ? '✅ Задача и подзадачи успешно созданы.' : '❌ Создание отменено.';

		if (confirm) {
			try {
				const task = await createTask({
					title: pendingProposal.title,
					description: pendingProposal.description || null,
					deadline: new Date(pendingProposal.deadline).toISOString(),
					priority: pendingProposal.priority,
					status: 'todo'
				});
				for (const st of (pendingProposal.subtasks || [])) {
					await createSubtask({
						id: crypto.randomUUID(),
						taskId: task.id,
						title: st.title,
						isCompleted: false,
						sortOrder: 0,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString()
					});
				}
				loadTasks();
			} catch { resultMsg = '⚠️ Ошибка при создании на сервере.'; }
		}

		setPendingProposal(null); setAiLoading(false);
		setAiMessages(prev => [...prev.filter(m => !m.proposal), { id: crypto.randomUUID(), role: 'assistant', content: resultMsg }]);
	};

	const handleDelete = async (id: string, e: React.MouseEvent) => { e.stopPropagation(); try { await deleteTask(id); loadTasks(); } catch { } };

	const getDeadlineStatus = (deadline?: string | null) => {
		if (!deadline) return { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Calendar, label: 'Без дедлайна' };
		const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
		if (diff < 0) return { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, label: 'Просрочено' };
		if (diff <= 3) return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle, label: `${diff} дн.` };
		if (diff <= 5) return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: `${diff} дн.` };
		return { color: 'bg-green-100 text-green-700 border-green-200', icon: Calendar, label: `${diff} дн.` };
	};

	const getPriorityIcon = (priority?: string | null) => {
		if (priority === 'high') return <Flag size={14} className="text-red-500" />;
		if (priority === 'medium') return <Flag size={14} className="text-amber-500" />;
		return <Flag size={14} className="text-green-500" />;
	};

	if (loading) return <div className="pt-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<h2 className="text-xl sm:text-2xl font-bold">📋 Мои задачи</h2>
				<div className="flex gap-2">
					<button onClick={() => openDrawer('ai')} className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition shadow-md shadow-indigo-200/50 min-h-[44px]"><Sparkles size={16} /> AI Task</button>
					<button onClick={() => openDrawer('manual')} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition shadow-md shadow-indigo-200/50 min-h-[44px]"><Plus size={16} /> Добавить</button>
				</div>
			</div>

			{tasks.length === 0 && <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300"><p className="text-gray-500">Задач пока нет. Создайте первую!</p></div>}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
				{tasks.map(task => {
					const status = getDeadlineStatus(task.deadline);
					return (
						<div key={task.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer p-4 flex flex-col gap-3" onClick={() => navigate(`/student/tasks/${task.id}`)}>
							<div className="flex justify-between items-start"><h3 className="font-semibold text-lg truncate">{task.title}</h3><button onClick={(e) => handleDelete(task.id, e)} className="p-1.5 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></div>
							<p className="text-sm text-gray-500 line-clamp-2">{task.description || 'Нет описания'}</p>
							<div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
								<div className="flex items-center gap-2"><span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${status.color}`}><status.icon size={12} /> {status.label}</span>{getPriorityIcon(task.priority)}</div>
								<span className="flex items-center gap-1 text-xs text-gray-500 font-medium">Открыть <ArrowRight size={12} /></span>
							</div>
						</div>
					);
				})}
			</div>

			<div className={`fixed inset-0 z-50 transition-opacity duration-200 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
				<div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeDrawer} />
				<div className={`absolute top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
					<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
						<div className="flex items-center gap-3">
							<button onClick={closeDrawer} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500"><ChevronLeft size={20} /></button>
							<h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">{drawerMode === 'manual' ? <><Plus size={18} /> Новая задача</> : <><Bot size={18} className="text-indigo-600" /> AI Конструктор</>}</h3>
						</div>
						<button onClick={closeDrawer} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500"><X size={18} /></button>
					</div>
					<div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
						{drawerMode === 'manual' ? (
							<form onSubmit={handleManualSubmit} className="space-y-4">
								<div className="space-y-1"><label className="text-xs font-medium text-gray-600">Название *</label><input required type="text" value={manualForm.title} onChange={e => setManualForm({ ...manualForm, title: e.target.value })} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40" placeholder="Введите название" /></div>
								<div className="space-y-1"><label className="text-xs font-medium text-gray-600">Описание</label><textarea value={manualForm.description} onChange={e => setManualForm({ ...manualForm, description: e.target.value })} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40 min-h-[80px]" placeholder="Краткое описание..." /></div>
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1"><label className="text-xs font-medium text-gray-600">Дедлайн</label><input type="date" value={manualForm.deadline} onChange={e => setManualForm({ ...manualForm, deadline: e.target.value })} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40" /></div>
									<div className="space-y-1"><label className="text-xs font-medium text-gray-600">Срочность</label><select value={manualForm.priority} onChange={e => setManualForm({ ...manualForm, priority: e.target.value as 'low' | 'medium' | 'high' })} className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40"><option value="low">Низкая</option><option value="medium">Средняя</option><option value="high">Высокая</option></select></div>
								</div>
								<button type="submit" disabled={manualLoading || !manualForm.title} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4">{manualLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Создать</button>
							</form>
						) : (
							<div className="flex flex-col h-full">
								<div className="flex-1 space-y-4 pb-4">
									{aiMessages.map(msg => (
										<div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
											<div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'}`}>
												{msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
												{msg.proposal && (
													<div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
														<p className="text-xs font-semibold text-indigo-900 mb-2">📋 Предложение AI:</p>
														<div className="space-y-1 text-xs text-indigo-800">
															<p><b>Задача:</b> {msg.proposal.title}</p>
															<p><b>Дедлайн:</b> {new Date(msg.proposal.deadline).toLocaleDateString()}</p>
															<p><b>Приоритет:</b> {msg.proposal.priority}</p>
															<p className="mt-2"><b>Подзадачи:</b></p>
															<ul className="list-disc pl-4">{msg.proposal.subtasks?.map((s: any, i: number) => <li key={i}>{s.title}</li>)}</ul>
														</div>
													</div>
												)}
											</div>
										</div>
									))}
									{pendingProposal && (
										<div className="flex gap-2 mt-2 p-2 bg-white rounded-lg border border-amber-200">
											<button onClick={() => executeProposal(true)} disabled={aiLoading} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-1"><Check size={14} /> Подтвердить</button>
											<button onClick={() => executeProposal(false)} disabled={aiLoading} className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-1"><X size={14} /> Отмена</button>
										</div>
									)}
									<div ref={aiEndRef} />
								</div>
								<div className="pt-4 border-t border-gray-200 bg-white -mx-6 -mb-6 p-4">
									<div className="flex items-center gap-2">
										<input type="text" placeholder="Опиши задачу..." className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40" value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSend()} disabled={aiLoading || !!pendingProposal || !apiKey} />
										<button onClick={handleAiSend} disabled={aiLoading || !!pendingProposal || !aiInput.trim() || !apiKey} className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition">{aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}