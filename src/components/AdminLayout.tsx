import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, LogOut, ChevronDown, User, GraduationCap } from 'lucide-react';
import { useState, useRef } from 'react';
import { useClickOutside } from '../hooks/useClickOutside';

export function AdminLayout() {
	const { logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);
	const pillRef = useRef<HTMLDivElement>(null);
	useClickOutside(pillRef, () => setIsOpen(false));

	const routes = [
		{ path: '/admin', label: 'Дашборд', icon: LayoutDashboard },
		{ path: '/admin/users', label: 'Пользователи', icon: Users },
		{ path: '/admin/courses', label: 'Курсы', icon: GraduationCap },
		{ path: '/admin/profile', label: 'Профиль', icon: User },
	];
	const currentRoute = routes.find(r => r.path === location.pathname);
	const displayLabel = currentRoute?.label || 'Админ-панель';

	return (
		<>
			<aside className="hidden md:flex fixed left-4 top-4 bottom-4 w-64 bg-gray-900 text-white rounded-2xl shadow-xl p-4 flex-col z-40">
				<button onClick={() => navigate('/')} className="flex items-center gap-3 mb-6 hover:opacity-80 transition cursor-pointer px-2">
					<div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">S</div>
					<h1 className="text-lg font-bold truncate">StuDo Admin</h1>
				</button>
				<nav className="flex-1 space-y-2">
					{routes.map(route => (
						<NavLink key={route.path} to={route.path} end={route.path === '/admin'} className={({ isActive }) =>
							`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-300 hover:bg-gray-800'}`
						}>
							<route.icon size={18} /> {route.label}
						</NavLink>
					))}
				</nav>
				<div className="pt-4 border-t border-gray-700">
					<button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-gray-800 transition"><LogOut size={18} /> Выйти</button>
				</div>
			</aside>

			<div className="md:hidden fixed top-4 left-4 right-4 z-50 flex items-center gap-3 pointer-events-none">
				<button onClick={() => navigate('/')} className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold shadow-lg pointer-events-auto active:scale-95 transition shrink-0">S</button>
				<div ref={pillRef} className="flex-1 relative pointer-events-auto">
					<button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-900 text-white rounded-xl shadow-lg transition-all active:scale-[0.98]">
						<span className="font-semibold truncate">{displayLabel}</span>
						<ChevronDown size={16} className={`transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'rotate-180' : ''}`} />
					</button>
					<div className={`absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-xl bg-gray-900 shadow-xl z-50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'max-h-64 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2 pointer-events-none'}`}>
						<nav className="p-2 space-y-1">
							{routes.map(route => (
								<NavLink key={route.path} to={route.path} end={route.path === '/admin'} onClick={() => setIsOpen(false)} className={({ isActive }) =>
									`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`
								}>
									<route.icon size={16} /> {route.label}
								</NavLink>
							))}
							<div className="border-t border-gray-700 mt-2 pt-2">
								<button onClick={() => { logout(); navigate('/'); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-gray-800 rounded-lg transition"><LogOut size={16} /> Выйти</button>
							</div>
						</nav>
					</div>
				</div>
			</div>

			<main className="md:pl-72 px-4 pt-20 md:pt-6 pb-8 min-h-screen bg-gray-50"><Outlet /></main>
		</>
	);
}