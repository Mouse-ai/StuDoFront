import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown, ArrowRight, Mail, Lock } from 'lucide-react';
import type { AuthTab } from '../types';

export function FloatingIsland() {
	const { user, isAuthenticated, logout, login, register } = useAuth();
	const navigate = useNavigate();
	const [showTooltip, setShowTooltip] = useState(false);
	const [activeTab, setActiveTab] = useState<AuthTab>('login');
	const containerRef = useRef<HTMLDivElement>(null);

	useClickOutside(containerRef, () => setShowTooltip(false));

	const toggleTooltip = () => setShowTooltip(prev => !prev);

	const tooltipClasses = `
    fixed left-1/2 -translate-x-1/2 top-20 w-[92%] max-w-sm z-[60]
    sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:top-full sm:mt-3 sm:w-[340px] sm:max-w-none
    origin-top transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
    rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden
    ${showTooltip ? 'max-h-[600px] opacity-100 scale-100 pointer-events-auto' : 'max-h-0 opacity-0 scale-95 pointer-events-none'}
	`;

	if (!isAuthenticated || !user) {
		return (
			<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl">
				<div className="flex items-center justify-between px-5 py-3 bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-lg shadow-indigo-100/50">
					<button onClick={() => navigate('/')} className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer focus:outline-none">
						<div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
						<h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">StuDo</h1>
					</button>

					<div ref={containerRef} className="relative">
						<button onClick={toggleTooltip} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition text-sm font-medium shadow-md shadow-indigo-200">
							<User size={16} /> Войти
						</button>

						<div className={tooltipClasses}>
							{showTooltip && (
								<div className="p-4">
									<div className="relative flex bg-gray-100 rounded-xl p-1 mb-4">
										<div className={`absolute inset-y-1 left-1 w-[calc(50%-8px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeTab === 'login' ? 'translate-x-0' : 'translate-x-full'}`} />
										<button onClick={() => setActiveTab('login')} className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors duration-300 ${activeTab === 'login' ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>Вход</button>
										<button onClick={() => setActiveTab('register')} className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors duration-300 ${activeTab === 'register' ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>Регистрация</button>
									</div>
									<AuthForm activeTab={activeTab} onSubmit={activeTab === 'login' ? login : register} />
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}

	const u = user;
	return (
		<div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl">
			<div className="flex items-center justify-between px-5 py-3 bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-lg shadow-indigo-100/50">
				<button onClick={() => navigate('/')} className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer focus:outline-none">
					<div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
					<h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">StuDo</h1>
				</button>

				<div ref={containerRef} className="relative">
					<button onClick={toggleTooltip} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-xl transition">
						<div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-medium text-sm">
							{u.name.charAt(0)}{u.surname.charAt(0)}
						</div>
						<span className="text-sm font-medium">{u.name}</span>
						<ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showTooltip ? 'rotate-180' : ''}`} />
					</button>

					<div className={tooltipClasses}>
						{showTooltip && (
							<div className="py-2">
								<div className="px-4 py-3 border-b border-gray-100">
									<p className="font-medium text-gray-800">{u.name} {u.surname}</p>
									<p className="text-xs text-gray-500 truncate">{u.email}</p>
								</div>
								<button onClick={() => navigate('/tasks')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition text-gray-700">Перейти к задачам</button>
								<button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition text-gray-700">Профиль</button>
								<button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 transition text-red-600 border-t border-gray-100 mt-1"><LogOut size={16} /> Выйти</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function AuthForm({ activeTab, onSubmit }: { activeTab: AuthTab; onSubmit: any }) {
	const [form, setForm] = useState({ email: '', password: '', name: '', surname: '', patronym: '', birth_date: '' });
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault(); setError(''); setLoading(true);
		try {
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			if (activeTab === 'login') await onSubmit(form.email, form.password);
			else await onSubmit({ ...form, birth_date: form.birth_date || null, patronym: form.patronym || null, timezone });
		} catch (err: any) { setError(err.message || 'Ошибка'); }
		finally { setLoading(false); }
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			{activeTab === 'register' && (
				<div className="grid grid-cols-2 gap-2">
					<input required placeholder="Фамилия" className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition" value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} />
					<input required placeholder="Имя" className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
					<input placeholder="Отчество" className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition" value={form.patronym} onChange={e => setForm({ ...form, patronym: e.target.value })} />
					<input type="date" className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })} />
				</div>
			)}
			<div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-300 transition">
				<Mail size={16} className="text-gray-400" />
				<input required type="email" placeholder="Email" className="w-full p-2.5 text-sm bg-transparent outline-none" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
			</div>
			<div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-300 transition">
				<Lock size={16} className="text-gray-400" />
				<input required type="password" placeholder="Пароль" className="w-full p-2.5 text-sm bg-transparent outline-none" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
			</div>
			{error && <p className="text-red-500 text-xs text-center">{error}</p>}
			<button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200/50">
				{loading ? 'Загрузка...' : activeTab === 'login' ? 'Войти' : 'Создать аккаунт'} <ArrowRight size={14} />
			</button>
		</form>
	);
}