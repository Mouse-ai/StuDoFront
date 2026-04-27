import { useState, useEffect } from 'react';
import { getAdminUsers, banUser, unbanUser } from '../api/client';
import type { User } from '../types';
import { Search, ArrowUpDown, ShieldBan, ShieldCheck, Bell, Send } from 'lucide-react';

export function AdminUsers() {
	const [users, setUsers] = useState<User[]>([]);
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<string | null>(null);

	useEffect(() => {
		const t = setTimeout(async () => {
			try { setUsers((await getAdminUsers(search, 1)).users); } catch { }
			finally { setLoading(false); }
		}, 300);
		return () => clearTimeout(t);
	}, [search]);

	const handleBan = async (id: string) => {
		const r = prompt('Причина блокировки:') || 'Забанен';
		setActionLoading(id);
		try {
			await banUser(id, r);
			setUsers(prev => prev.map(u => u.id === id ? { ...u, isBanned: true, banReason: r } : u));
		} finally { setActionLoading(null); }
	};

	const handleUnban = async (id: string) => {
		setActionLoading(id);
		try {
			await unbanUser(id);
			setUsers(prev => prev.map(u => u.id === id ? { ...u, isBanned: false, banReason: null } : u));
		} finally { setActionLoading(null); }
	};

	if (loading) return <div className="flex justify-center pt-10 text-gray-500">Загрузка...</div>;

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h2 className="text-2xl font-bold text-gray-900">Пользователи</h2>
				<div className="relative flex-1 sm:flex-none">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
					<input type="text" placeholder="Поиск..." className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40" value={search} onChange={e => setSearch(e.target.value)} />
				</div>
			</div>

			<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm min-w-[900px]">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-4 py-3 font-medium text-gray-600 flex items-center gap-1">Пользователь <ArrowUpDown size={12} /></th>
								<th className="px-4 py-3 font-medium text-gray-600">Email</th>
								<th className="px-4 py-3 font-medium text-gray-600">Роль</th>
								<th className="px-4 py-3 font-medium text-gray-600">Уведомления</th>
								<th className="px-4 py-3 font-medium text-gray-600">Telegram</th>
								<th className="px-4 py-3 font-medium text-gray-600">Статус</th>
								<th className="px-4 py-3 font-medium text-gray-600">Действия</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{users.map(u => (
								<tr key={u.id} className="hover:bg-gray-50/50 transition">
									<td className="px-4 py-3">
										<div className="font-medium text-gray-900">{u.surname} {u.name}</div>
									</td>
									<td className="px-4 py-3 text-gray-600">{u.email}</td>
									<td className="px-4 py-3">
										<span className={`px-2 py-1 rounded-lg text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
											{u.role === 'admin' ? 'Админ' : 'Студент'}
										</span>
									</td>
									<td className="px-4 py-3">
										{u.notifications ? (
											<span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600"><Bell size={12} /> Включено</span>
										) : (
											<span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400"><Bell size={12} /> Выключено</span>
										)}
									</td>
									<td className="px-4 py-3">
										{u.tgUsername ? (
											<span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600"><Send size={12} /> @{u.tgUsername}</span>
										) : (
											<span className="text-xs text-gray-400">—</span>
										)}
									</td>
									<td className="px-4 py-3">
										{u.isBanned ? (
											<span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600"><ShieldBan size={12} /> {u.banReason || 'Забанен'}</span>
										) : (
											<span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600"><ShieldCheck size={12} /> Активен</span>
										)}
									</td>
									<td className="px-4 py-3">
										{u.role === 'admin' ? (
											<span className="text-xs text-gray-400 italic">Недоступно</span>
										) : u.isBanned ? (
											<button onClick={() => handleUnban(u.id)} disabled={actionLoading === u.id} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition disabled:opacity-50">Разбанить</button>
										) : (
											<button onClick={() => handleBan(u.id)} disabled={actionLoading === u.id} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition disabled:opacity-50">Забанить</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}