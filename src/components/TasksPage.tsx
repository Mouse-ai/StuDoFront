import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAiKey, getAiModel, getTasks, createTask, deleteTask } from '../api/client';
import type { Task } from '../types';
import { Send, Plus, Trash2, Calendar, Loader2, Sparkles, ArrowRight, AlertTriangle, Clock, Flag } from 'lucide-react';
import { AiTaskCreator } from './AiTaskCreator';

export function TasksPage() {
	const navigate = useNavigate();
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [apiKey, setApiKey] = useState<string>('');
	const [isAiOpen, setIsAiOpen] = useState(false);

	useEffect(() => {
		let mounted = true;
		const init = async () => {
			try {
				const [tasksData, key, model] = await Promise.allSettled([getTasks(), getAiKey(), getAiModel()]);
				if (tasksData.status === 'fulfilled') setTasks(tasksData.value?.filter(t => t.status !== 'cancelled') || []);
				if (key.status === 'fulfilled') setApiKey(key.value || '');
			} finally { if (mounted) setLoading(false); }
		};
		init();
		return () => { mounted = false; };
	}, []);

	const reloadTasks = useCallback(async () => {
		try { setTasks((await getTasks())?.filter(t => t.status !== 'cancelled') || []); } catch { }
	}, []);

	const addTask = async () => {
		const newTask = { title: 'Новая задача', description: '', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), priority: 'medium', status: 'todo' };
		try { await createTask(newTask); reloadTasks(); } catch { }
	};

	const removeTask = async (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		try { await deleteTask(id); reloadTasks(); } catch { }
	};

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
		<div className="max-w-5xl mx-auto space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<h2 className="text-xl sm:text-2xl font-bold">📋 Мои задачи</h2>
				<div className="flex gap-2">
					<button onClick={() => setIsAiOpen(true)} className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition shadow-md shadow-indigo-200/50 min-h-[44px]"><Sparkles size={16} /> AI Task</button>
					<button onClick={addTask} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition shadow-md shadow-indigo-200/50 min-h-[44px]"><Plus size={16} /> Добавить</button>
				</div>
			</div>
			{tasks.length === 0 && <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300"><p className="text-gray-500">Задач пока нет. Создайте первую!</p></div>}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{tasks.map(task => {
					const status = getDeadlineStatus(task.deadline);
					return (
						<div key={task.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer p-4 flex flex-col gap-3" onClick={() => navigate(`/student/tasks/${task.id}`)}>
							<div className="flex justify-between items-start"><h3 className="font-semibold text-lg truncate">{task.title}</h3><button onClick={(e) => removeTask(task.id, e)} className="p-1.5 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></div>
							<p className="text-sm text-gray-500 line-clamp-2">{task.description || 'Нет описания'}</p>
							<div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
								<div className="flex items-center gap-2"><span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${status.color}`}><status.icon size={12} /> {status.label}</span>{getPriorityIcon(task.priority)}</div>
								<span className="flex items-center gap-1 text-xs text-gray-500 font-medium">Открыть <ArrowRight size={12} /></span>
							</div>
						</div>
					);
				})}
			</div>
			<AiTaskCreator isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} onTaskCreated={reloadTasks} />
		</div>
	);
}