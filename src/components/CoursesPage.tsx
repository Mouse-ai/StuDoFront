import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getCourses, createCourse, updateCourse, deleteCourse, getTasks } from '../api/client';
import type { Course, Task } from '../types';
import { Plus, Trash2, Edit3, Calendar, Filter, X, GraduationCap, Save, Loader2 } from 'lucide-react';

export function CoursesPage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [courses, setCourses] = useState<Course[]>([]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCourse, setEditingCourse] = useState<Course | null>(null);
	const [form, setForm] = useState<Partial<Course>>({});

	const loadData = useCallback(async () => {
		try {
			const [c, t] = await Promise.allSettled([getCourses(), getTasks()]);
			setCourses(c.status === 'fulfilled' ? (c.value || []) : []);
			setTasks(t.status === 'fulfilled' ? (t.value || []) : []);
		} finally { setLoading(false); }
	}, []);

	useEffect(() => { loadData(); }, [loadData]);

	const getProgress = (courseId: string) => {
		const courseTasks = tasks.filter((t: any) => t.courseId === courseId || t.course_id === courseId);
		if (courseTasks.length === 0) return 0;
		const completed = courseTasks.filter(t => t.status === 'done' || t.status === 'cancelled' ? false : t.completedAt != null || false).length;
		return Math.round((completed / courseTasks.length) * 100);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (editingCourse) await updateCourse(editingCourse.id, { ...editingCourse, ...form });
			else await createCourse({ ...form, userId: user?.id, name: form.name || '', credits: Number(form.credits) || 0 });
			setIsModalOpen(false);
			setEditingCourse(null);
			setForm({});
			loadData();
		} catch { }
	};

	const handleDelete = async (id: string) => {
		try { await deleteCourse(id); loadData(); } catch { }
	};

	if (loading) return <div className="pt-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

	const isAdmin = user?.role === 'admin';

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<h2 className="text-xl sm:text-2xl font-bold">📚 Курсы</h2>
				{isAdmin && (
					<button onClick={() => { setEditingCourse(null); setForm({}); setIsModalOpen(true); }} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition shadow-md shadow-indigo-200/50 min-h-[44px]">
						<Plus size={16} /> Добавить курс
					</button>
				)}
			</div>

			{courses.length === 0 && (
				<div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
					<p className="text-gray-500">Курсов пока нет.</p>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{courses.map(course => {
					const progress = getProgress(course.id);
					return (
						<div key={course.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="font-semibold text-lg truncate">{course.name}</h3>
									<div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
										{course.code && <span className="bg-gray-100 px-2 py-0.5 rounded">{course.code}</span>}
										{course.semester && <span className="flex items-center gap-1"><Calendar size={10} /> {course.semester}</span>}
										{course.credits && <span className="flex items-center gap-1"><GraduationCap size={10} /> {course.credits} кр.</span>}
									</div>
								</div>
								{isAdmin && (
									<div className="flex gap-1">
										<button onClick={() => { setEditingCourse(course); setForm(course); setIsModalOpen(true); }} className="p-1.5 hover:bg-blue-50 rounded-lg transition text-gray-400 hover:text-blue-600"><Edit3 size={14} /></button>
										<button onClick={() => handleDelete(course.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
									</div>
								)}
							</div>

							{!isAdmin && (
								<>
									<div className="space-y-1">
										<div className="flex justify-between text-xs text-gray-500"><span>Прогресс</span><span>{progress}%</span></div>
										<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
									</div>
									<button onClick={() => navigate(`/student/tasks`)} className="mt-auto flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 transition">
										<Filter size={12} /> Задачи курса
									</button>
								</>
							)}
						</div>
					);
				})}
			</div>

			{isModalOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
					<div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()} style={{ animation: 'dialogIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-bold">{editingCourse ? 'Редактировать курс' : 'Новый курс'}</h3>
							<button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
						</div>
						<form onSubmit={handleSubmit} className="space-y-3">
							<input required placeholder="Название" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
							<input placeholder="Код (например, MATH101)" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40" value={form.code || ''} onChange={e => setForm({ ...form, code: e.target.value })} />
							<div className="grid grid-cols-2 gap-3">
								<input placeholder="Семестр" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40" value={form.semester || ''} onChange={e => setForm({ ...form, semester: e.target.value })} />
								<input type="number" placeholder="Кредиты" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40" value={form.credits || ''} onChange={e => setForm({ ...form, credits: Number(e.target.value) })} />
							</div>
							<button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 mt-2"><Save size={16} /> Сохранить</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}