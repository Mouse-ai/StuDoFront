import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch, getAiKey, getAiModel, getSubtasks, createSubtask, updateSubtask, deleteSubtask, updateTask } from '../api/client';
import type { Task, Subtask } from '../types';
import { ArrowLeft, Send, Plus, Trash2, Check, MessageSquare, Loader2, AlertCircle } from 'lucide-react';

export function TaskPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [task, setTask] = useState<Task | null>(null);
	const [subtasks, setSubtasks] = useState<Subtask[]>([]);
	const [chat, setChat] = useState<{ id: string; role: string; content: string }[]>([]);
	const [chatInput, setChatInput] = useState('');
	const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
	const [loading, setLoading] = useState(true);
	const [apiKey, setApiKey] = useState('');
	const [modelName, setModelName] = useState('meta-llama/llama-3.3-70b-instruct');

	useEffect(() => {
		const init = async () => {
			try {
				const [taskRes, subsRes, keyRes, modelRes] = await Promise.allSettled([
					apiFetch<Task>(`/api/Tasks/${id}`),
					getSubtasks(),
					getAiKey(),
					getAiModel()
				]);
				if (taskRes.status === 'fulfilled') setTask(taskRes.value);
				else navigate('/student/tasks');
				if (subsRes.status === 'fulfilled') setSubtasks(subsRes.value?.filter(s => s.taskId === id) || []);
				if (keyRes.status === 'fulfilled') setApiKey(keyRes.value || '');
				if (modelRes.status === 'fulfilled') setModelName(modelRes.value || 'meta-llama/llama-3.3-70b-instruct');
			} catch { navigate('/student/tasks'); }
			finally { setLoading(false); }
		};
		init();
	}, [id, navigate]);

	const saveTask = async (updated: Partial<Task>) => {
		if (!task || !id) return;
		try {
			await apiFetch(`/api/Tasks/${id}`, { method: 'PUT', body: JSON.stringify({ ...task, ...updated }) });
			setTask(prev => prev ? { ...prev, ...updated } : null);
		} catch { }
	};

	const addSubtask = async () => {
		if (!newSubtaskTitle.trim() || !task) return;
		const sub: Subtask = { id: crypto.randomUUID(), taskId: task.id, title: newSubtaskTitle.trim(), isCompleted: false, sortOrder: subtasks.length, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
		setSubtasks(prev => [...prev, sub]);
		setNewSubtaskTitle('');
		try { await createSubtask(sub); } catch { }
	};

	const toggleSubtask = async (subId: string, current: boolean) => {
		// 1. Оптимистичное обновление локального стейта
		const updatedSubtasks = subtasks.map(s =>
			s.id === subId ? { ...s, isCompleted: !current, updatedAt: new Date().toISOString() } : s
		);
		setSubtasks(updatedSubtasks);

		// 2. Синхронизация подзадачи с сервером
		try {
			await updateSubtask(subId, { isCompleted: !current });
		} catch (err) {
			console.error('Failed to toggle subtask:', err);
		}

		// 3. Вычисление общего статуса задачи
		const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.isCompleted);
		const newStatus = allCompleted ? 'done' : 'in_progress';

		// 4. Если статус изменился → обновляем задачу на сервере
		if (task && task.status !== newStatus) {
			setTask(prev => prev ? { ...prev, status: newStatus } : null);

			try {
				await updateTask(task.id, {
					title: task.title || '',
					description: task.description,
					deadline: task.deadline,
					priority: task.priority,
					status: newStatus
				});
			} catch (err) {
				console.error('Failed to update task status:', err);
				setTask(prev => prev ? { ...prev, status: task.status } : null);
			}
		}
	};

	const removeSubtask = async (subId: string) => {
		setSubtasks(prev => prev.filter(s => s.id !== subId));
		try { await deleteSubtask(subId); } catch { }
	};

	const sendChat = async (text: string) => {
		if (!text.trim() || !apiKey || !task) return;
		const userMsg = { id: crypto.randomUUID(), role: 'user', content: text };
		setChat(prev => [...prev, userMsg]);
		setChatInput('');
		const messages = [...chat.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: text }];
		try {
			const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
				method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'StuDo' },
				body: JSON.stringify({ model: modelName, messages: [{ role: 'system', content: `Помощник по задаче "${task.title}". Отвечай кратко.` }, ...messages] })
			});
			const data = await res.json();
			setChat(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.choices?.[0]?.message?.content || 'Ошибка.' }]);
		} catch { setChat(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Сеть недоступна.' }]); }
	};

	if (loading) return <div className="pt-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
	if (!task) return <div className="pt-10 text-center text-gray-500">Задача не найдена</div>;

	const completedCount = subtasks.filter(s => s.isCompleted).length;
	const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center gap-4">
				<button onClick={() => navigate('/student/tasks')} className="p-2 hover:bg-gray-100 rounded-xl transition shrink-0"><ArrowLeft size={20} /></button>
				<div className="flex-1 space-y-2">
					<input value={task.title} onChange={e => setTask(prev => prev ? { ...prev, title: e.target.value } : null)} onBlur={() => saveTask({ title: task.title })} className="text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-500 outline-none w-full transition px-1" placeholder="Название задачи" />
					<div className="flex items-center gap-3 text-xs text-gray-500 px-1">
						<span>Прогресс: {progress}%</span>
						<div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }}></div></div>
						{task.deadline && <span className="ml-auto">Дедлайн: {new Date(task.deadline).toLocaleDateString()}</span>}
					</div>
				</div>
			</div>
			<div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
				<textarea value={task.description || ''} onChange={e => setTask(prev => prev ? { ...prev, description: e.target.value } : null)} onBlur={() => saveTask({ description: task.description })} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-300 min-h-[80px] resize-y transition" placeholder="Описание задачи..." />
			</div>
			<div className="flex flex-col xl:flex-row gap-6">
				<div className="flex-1 space-y-4">
					<div className="flex gap-2">
						<input type="text" value={newSubtaskTitle} onChange={e => setNewSubtaskTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSubtask()} placeholder="Добавить подзадачу..." className="flex-1 p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-300" />
						<button onClick={addSubtask} className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-1"><Plus size={16} /> Добавить</button>
					</div>
					<div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
						{subtasks.length === 0 ? <div className="p-8 text-center text-gray-400"><AlertCircle size={24} className="mx-auto mb-2 opacity-50" />Нет подзадач. Добавьте первую для декомпозиции.</div> : subtasks.map(sub => (
							<div key={sub.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition group">
								<button onClick={() => toggleSubtask(sub.id, sub.isCompleted || false)} className={`w-5 h-5 rounded border flex items-center justify-center transition ${sub.isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-indigo-500'}`}>{sub.isCompleted && <Check size={12} className="text-white" />}</button>
								<span className={`flex-1 text-sm ${sub.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>{sub.title}</span>
								<button onClick={() => removeSubtask(sub.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
							</div>
						))}
					</div>
				</div>
				<div className="xl:w-80 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm h-[400px] xl:h-[600px]">
					<div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50 rounded-t-xl shrink-0"><MessageSquare size={16} className="text-indigo-600" /><span className="font-semibold text-sm">AI Ассистент</span></div>
					<div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50">
						{chat.length === 0 && <p className="text-xs text-gray-400 text-center mt-10">Задайте вопрос по задаче. ИИ поможет спланировать шаги.</p>}
						{chat.map(msg => (
							<div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
								<div className={`max-w-[90%] p-2.5 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'}`}>{msg.content}</div>
							</div>
						))}
					</div>
					<div className="p-3 border-t border-gray-200 flex gap-2 shrink-0">
						<input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat(chatInput)} disabled={!apiKey} placeholder="Спросить ИИ..." className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-300" />
						<button onClick={() => sendChat(chatInput)} disabled={!apiKey || !chatInput.trim()} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"><Send size={16} /></button>
					</div>
				</div>
			</div>
		</div>
	);
}