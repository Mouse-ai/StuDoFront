import { useState, useEffect, useCallback } from 'react';
import { apiFetch, logAiRequest } from '../api/client';
import type { Task, ChatMessage } from '../types';
import { Send, Plus, Trash2, Calendar, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { AiTaskCreator } from './AiTaskCreator';

const TASKS_URL = '/api/Tasks';

export function TasksPage() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [apiKey, setApiKey] = useState<string>('');
	const [isAiOpen, setIsAiOpen] = useState(false);

	useEffect(() => {
		let mounted = true;
		const fetchKey = async () => {
			try {
				const key = await apiFetch<string>('/api/Ai/key');
				if (mounted) setApiKey(key);
			} catch {
				if (mounted) setApiKey(import.meta.env.VITE_OPENROUTER_API_KEY || '');
			}
		};
		fetchKey();
		return () => { mounted = false; };
	}, []);

	const loadTasks = useCallback(async () => {
		try {
			const data = await apiFetch<Task[]>(TASKS_URL);
			setTasks(data?.map(t => ({ ...t, chatHistory: t.chatHistory || [] })) || []);
		} catch {
			const local = localStorage.getItem('local-tasks');
			setTasks(local ? JSON.parse(local) : []);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { loadTasks(); }, [loadTasks]);

	const saveLocal = (updated: Task[]) => {
		localStorage.setItem('local-tasks', JSON.stringify(updated));
		setTasks(updated);
	};

	const addTask = async () => {
		const newTask: Task = {
			id: crypto.randomUUID(),
			title: 'Новая задача',
			subject: 'Общее',
			deadline: new Date().toISOString().split('T')[0],
			completed: false,
			chatHistory: []
		};
		try {
			await apiFetch<Task>(TASKS_URL, { method: 'POST', body: JSON.stringify(newTask) });
			loadTasks();
		} catch {
			saveLocal([newTask, ...tasks]);
		}
	};

	const toggleComplete = async (id: string) => {
		const task = tasks.find(t => t.id === id);
		if (!task) return;
		const updated = { ...task, completed: !task.completed };
		try {
			await apiFetch(`${TASKS_URL}/${id}`, { method: 'PUT', body: JSON.stringify(updated) });
			loadTasks();
		} catch {
			saveLocal(tasks.map(t => t.id === id ? updated : t));
		}
	};

	const deleteTask = async (id: string) => {
		try {
			await apiFetch(`${TASKS_URL}/${id}`, { method: 'DELETE' });
			loadTasks();
		} catch {
			saveLocal(tasks.filter(t => t.id !== id));
		}
	};

	const sendMessage = async (taskId: string, text: string) => {
		if (!text.trim() || !apiKey) return;
		const task = tasks.find(t => t.id === taskId);
		if (!task) return;

		const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
		const updatedHistory = [...task.chatHistory, userMsg];
		saveLocal(tasks.map(t => t.id === taskId ? { ...t, chatHistory: updatedHistory } : t));

		try {
			const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'StuDo' },
				body: JSON.stringify({
					model: 'meta-llama/llama-3.3-70b-instruct',
					messages: [
						{ role: 'system', content: `Ты учебный ассистент для задачи "${task.title}" (предмет: ${task.subject}). Отвечай кратко, используй контекст переписки.` },
						...updatedHistory.map(m => ({ role: m.role, content: m.content }))
					]
				})
			});
			const data = await res.json();
			const reply = data.choices?.[0]?.message?.content || 'Ошибка ИИ.';

			if (data.usage) {
				logAiRequest({
					model: 'meta-llama/llama-3.3-70b-instruct',
					promptTokens: data.usage.prompt_tokens,
					completionTokens: data.usage.completion_tokens,
					totalTokens: data.usage.total_tokens,
					status: 'success'
				});
			}

			saveLocal(tasks.map(t => t.id === taskId ? { ...t, chatHistory: [...updatedHistory, { id: crypto.randomUUID(), role: 'assistant', content: reply }] } : t));
		} catch (err: any) {
			logAiRequest({
				model: 'meta-llama/llama-3.3-70b-instruct',
				status: 'error',
				errorMessage: err.message
			});
			saveLocal(tasks.map(t => t.id === taskId ? { ...t, chatHistory: [...updatedHistory, { id: crypto.randomUUID(), role: 'assistant', content: 'Сеть недоступна.' }] } : t));
		}
	};

	if (loading) return <div className="pt-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

	return (
		<div className="max-w-5xl mx-auto space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<h2 className="text-xl sm:text-2xl font-bold">📋 Мои задачи</h2>
				<div className="flex gap-2">
					<button onClick={() => setIsAiOpen(true)} className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition shadow-md shadow-indigo-200/50 min-h-[44px]">
						<Sparkles size={16} /> AI Task
					</button>
					<button onClick={addTask} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition shadow-md shadow-indigo-200/50 min-h-[44px]">
						<Plus size={16} /> Добавить
					</button>
				</div>
			</div>

			{tasks.length === 0 && (
				<div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
					<p className="text-gray-500">Задач пока нет. Создайте первую!</p>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{tasks.map(task => (
					<div key={task.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
						<div className="p-4 border-b border-gray-100 flex items-start justify-between gap-3">
							<div className="min-w-0">
								<h3 className={`font-semibold truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</h3>
								<p className="text-sm text-gray-500 flex items-center gap-2 mt-1"><Calendar size={12} /> {new Date(task.deadline).toLocaleDateString()} • {task.subject}</p>
							</div>
							<div className="flex gap-1 shrink-0">
								<button onClick={() => toggleComplete(task.id)} className="p-2 hover:bg-gray-100 rounded-lg transition text-green-600 min-w-[40px] min-h-[40px] flex items-center justify-center"><CheckCircle size={18} /></button>
								<button onClick={() => deleteTask(task.id)} className="p-2 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500 min-w-[40px] min-h-[40px] flex items-center justify-center"><Trash2 size={18} /></button>
							</div>
						</div>

						<div className="h-40 sm:h-48 flex flex-col bg-gray-50/50">
							<div className="flex-1 overflow-y-auto p-3 space-y-2">
								{task.chatHistory.length === 0 && <p className="text-xs text-gray-400 text-center mt-6">Напишите вопрос по задаче. AI запомнит контекст.</p>}
								{task.chatHistory.map(msg => (
									<div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
										<div className={`max-w-[85%] p-2.5 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'}`}>
											{msg.content}
										</div>
									</div>
								))}
							</div>
							<ChatInput onSend={(text) => sendMessage(task.id, text)} disabled={!apiKey} />
						</div>
					</div>
				))}
			</div>

			<AiTaskCreator isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} onTaskCreated={loadTasks} />
		</div>
	);
}

function ChatInput({ onSend, disabled }: { onSend: (t: string) => void; disabled: boolean }) {
	const [val, setVal] = useState('');
	return (
		<div className="flex items-center gap-2 p-3 border-t border-gray-200 bg-white">
			<input
				type="text"
				placeholder="Спросить ИИ..."
				className="flex-1 p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-300 min-h-[40px]"
				value={val}
				onChange={e => setVal(e.target.value)}
				onKeyDown={e => e.key === 'Enter' && (onSend(val), setVal(''))}
				disabled={disabled}
			/>
			<button
				onClick={() => { onSend(val); setVal(''); }}
				disabled={disabled}
				className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
			>
				<Send size={16} />
			</button>
		</div>
	);
}