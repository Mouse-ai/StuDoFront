import { NavLink, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';

export function ProtectedLayout() {
	const { isAuthenticated, isLoading, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);
	const pillRef = useRef<HTMLDivElement>(null);

	useClickOutside(pillRef, () => setIsOpen(false));

	if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Загрузка...</div>;
	if (!isAuthenticated) return <Navigate to="/" replace />;

	const routes = [
		{ path: '/tasks', label: 'Задачи', icon: BookOpen },
		{ path: '/profile', label: 'Профиль', icon: User },
	];
	const currentRoute = routes.find(r => r.path === location.pathname);
	const displayLabel = currentRoute?.label || 'Меню';

	return (
		<>
			{/* 🖥 DESKTOP: Плавающий сайдбар */}
			<aside className="hidden md:flex fixed left-4 top-4 bottom-4 w-64 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl p-4 flex-col z-40">
				<button onClick={() => navigate('/')} className="flex items-center gap-3 mb-6 hover:opacity-80 transition cursor-pointer px-2">
					<div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">S</div>
					<h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 truncate">StuDo</h1>
				</button>

				<nav className="flex-1 space-y-2">
					{routes.map(route => (
						<NavLink key={route.path} to={route.path} className={({ isActive }) =>
							`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50/80'}`
						}>
							<route.icon size={18} /> {route.label}
						</NavLink>
					))}
				</nav>
				<div className="pt-4 border-t border-gray-100">
					<button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition">
						<LogOut size={18} /> Выйти
					</button>
				</div>
			</aside>

			{/* 📱 MOBILE: Жёстко зафиксированная шапка */}
			<div className="md:hidden fixed top-4 left-4 right-4 z-50 flex items-center gap-3 pointer-events-none">
				{/* Иконка приложения (никогда не сдвигается) */}
				<button
					onClick={() => navigate('/')}
					className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg pointer-events-auto active:scale-95 transition shrink-0"
					aria-label="На главную"
				>
					S
				</button>

				{/* Контейнер пилла + меню */}
				<div ref={pillRef} className="flex-1 relative pointer-events-auto">
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="w-full flex items-center justify-between px-4 py-2.5 bg-white/85 backdrop-blur-xl border border-white/40 rounded-xl shadow-lg shadow-indigo-100/30 transition-all active:scale-[0.98]"
					>
						<span className="font-semibold text-gray-800 truncate">{displayLabel}</span>
						<ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'rotate-180' : ''}`} />
					</button>

					{/* Выпадающее меню (абсолютное, не влияет на вёрстку) */}
					<div className={`absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl z-50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'max-h-64 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'
						}`}>
						<nav className="p-2 space-y-1">
							{routes.map(route => (
								<NavLink key={route.path} to={route.path} onClick={() => setIsOpen(false)} className={({ isActive }) =>
									`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`
								}>
									<route.icon size={16} /> {route.label}
								</NavLink>
							))}
							<div className="border-t border-gray-100 mt-2 pt-2">
								<button onClick={() => { logout(); navigate('/'); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition">
									<LogOut size={16} /> Выйти
								</button>
							</div>
						</nav>
					</div>
				</div>
			</div>

			{/* 📄 Основной контент */}
			<main className="md:pl-72 px-4 pt-20 md:pt-6 pb-8 min-h-screen">
				<Outlet />
			</main>
		</>
	);
}