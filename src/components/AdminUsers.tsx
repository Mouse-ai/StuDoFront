import { useState, useEffect } from 'react';
import { getAdminUsers } from '../api/client';
import type { User } from '../types';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export function AdminUsers() {
	const [users, setUsers] = useState<User[]>([]);
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const data = await getAdminUsers(search, 1);
				setUsers(data.users);
			} catch { setUsers([]); }
			finally { setLoading(false); }
		};
		const timer = setTimeout(load, 300);
		return () => clearTimeout(timer);
	}, [search]);

	if (loading) return <div className="flex justify-center pt-10 text-gray-500">Загрузка...</div>;

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h2 className="text-2xl font-bold text-gray-900">Пользователи</h2>
				<div className="flex gap-2 w-full sm:w-auto">
					<div className="relative flex-1 sm:flex-none">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
						<input
							type="text"
							placeholder="Поиск по имени или email"
							className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
							value={search}
							onChange={e => setSearch(e.target.value)}
						/>
					</div>
					<button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"><Filter size={18} className="text-gray-500" /></button>
				</div>
			</div>

			<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-sm">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-4 py-3 font-medium text-gray-600 flex items-center gap-1">Пользователь <ArrowUpDown size={12} /></th>
								<th className="px-4 py-3 font-medium text-gray-600">Email</th>
								<th className="px-4 py-3 font-medium text-gray-600">Роль</th>
								<th className="px-4 py-3 font-medium text-gray-600">Telegram</th>
								<th className="px-4 py-3 font-medium text-gray-600">Часовой пояс</th>
								<th className="px-4 py-3 font-medium text-gray-600">Уведомления</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{users.map(u => (
								<tr key={u.id} className="hover:bg-gray-50/50 transition">
									<td className="px-4 py-3">
										<div className="font-medium text-gray-900">{u.surname} {u.name}</div>
										<div className="text-xs text-gray-500">{u.patronym || '-'}</div>
									</td>
									<td className="px-4 py-3 text-gray-600">{u.email}</td>
									<td className="px-4 py-3">
										<span className={`px-2 py-1 rounded-lg text-xs font-medium ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
											{u.role === 'admin' ? 'Админ' : 'Студент'}
										</span>
									</td>
									<td className="px-4 py-3 text-gray-600">{u.tgUsername ? `@${u.tgUsername}` : '-'}</td>
									<td className="px-4 py-3 text-gray-600">{u.timezone.replace('_', ' ')}</td>
									<td className="px-4 py-3">
										<span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.notifications ? 'text-green-600' : 'text-gray-400'}`}>
											<span className={`w-2 h-2 rounded-full ${u.notifications ? 'bg-green-500' : 'bg-gray-300'}`}></span>
											{u.notifications ? 'Вкл' : 'Выкл'}
										</span>
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