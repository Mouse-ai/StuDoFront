import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function DashboardLayout() {
	const { logout } = useAuth();

	const navItems = [
		{ to: '/tasks', label: 'Задачи', icon: BookOpen },
		{ to: '/profile', label: 'Профиль', icon: User },
	];

	return (
		<>
			<aside className="fixed left-4 top-24 bottom-4 w-64 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl p-4 flex flex-col z-40 transition-all duration-300">
				<nav className="flex-1 space-y-2">
					{navItems.map(item => (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) =>
								`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50/80'
								}`
							}
						>
							<item.icon size={18} />
							{item.label}
						</NavLink>
					))}
				</nav>
				<div className="pt-4 border-t border-gray-100 mt-auto">
					<button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition">
						<LogOut size={18} /> Выйти
					</button>
				</div>
			</aside>

			<main className="pl-72 pr-4 pt-24 pb-8 min-h-screen">
				<Outlet />
			</main>
		</>
	);
}