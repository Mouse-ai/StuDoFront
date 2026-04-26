/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Loader2, Bell, Send } from 'lucide-react';
import { apiFetch } from '../api/client';
import type { UpdateProfileRequest } from '../types';

export function ProfilePage() {
	const { user, refreshUser } = useAuth();
	const [form, setForm] = useState<UpdateProfileRequest>({
		surname: '', name: '', patronym: '', birth_date: '',
		email: '', password: '', notifications: false, tg_username: ''
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		if (user) {
			setForm({
				surname: user.surname || '',
				name: user.name || '',
				patronym: user.patronym || '',
				birth_date: user.birth_date || '',
				email: user.email || '',
				password: '',
				notifications: user.notifications ?? false,
				tg_username: user.tg_username || ''
			});
		}
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true); setError(''); setSuccess('');
		try {
			const { password, ...userData } = form;
			const payload: UpdateProfileRequest = {
				...userData,
				patronym: userData.patronym || null,
				birth_date: userData.birth_date || null,
				tg_username: userData.tg_username?.trim() || null,
				password: password && password.length > 0 ? password : undefined
			};

			await apiFetch('/api/Auth/me', { method: 'PUT', body: JSON.stringify(payload) });
			await refreshUser();
			setSuccess('Данные успешно сохранены');
			setForm(prev => ({ ...prev, password: '' }));
		} catch (err: any) {
			setError(err.message || 'Ошибка сохранения');
		} finally {
			setLoading(false);
		}
	};

	const personalFields = [
		{ key: 'surname' as const, label: 'Фамилия', required: true },
		{ key: 'name' as const, label: 'Имя', required: true },
		{ key: 'patronym' as const, label: 'Отчество', required: false },
	];

	return (
		<div className="max-w-2xl mx-auto">
			<h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Настройки профиля</h2>

			<form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">

				{/* 👤 Личные данные */}
				<fieldset className="space-y-4">
					<legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Личные данные</legend>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{personalFields.map(field => (
							<div key={field.key} className="space-y-1">
								<label className="text-sm font-medium text-gray-700">{field.label}</label>
								<input
									required={field.required}
									className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 min-h-[44px]"
									value={form[field.key] || ''}
									onChange={e => setForm({ ...form, [field.key]: e.target.value })}
								/>
							</div>
						))}
						<div className="space-y-1 sm:col-span-2">
							<label className="text-sm font-medium text-gray-700">Дата рождения</label>
							<input
								type="date"
								className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 min-h-[44px]"
								value={form.birth_date || ''}
								onChange={e => setForm({ ...form, birth_date: e.target.value })}
							/>
						</div>
					</div>
				</fieldset>

				{/* 🔐 Безопасность */}
				<fieldset className="space-y-4 pt-2 border-t border-gray-100">
					<legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Безопасность</legend>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700">Email</label>
							<input
								type="email"
								required
								className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 min-h-[44px]"
								value={form.email || ''}
								onChange={e => setForm({ ...form, email: e.target.value })}
							/>
						</div>
						<div className="space-y-1">
							<label className="text-sm font-medium text-gray-700">Новый пароль</label>
							<input
								type="password"
								placeholder="Оставьте пустым"
								className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 min-h-[44px]"
								value={form.password || ''}
								onChange={e => setForm({ ...form, password: e.target.value })}
							/>
						</div>
					</div>
				</fieldset>

				{/* 🔔 Уведомления и Telegram */}
				<fieldset className="space-y-4 pt-2 border-t border-gray-100">
					<legend className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Уведомления</legend>

					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 gap-3">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0"><Bell size={18} /></div>
							<div>
								<p className="text-sm font-medium text-gray-800">Email-уведомления</p>
								<p className="text-xs text-gray-500">Напоминания о дедлайнах</p>
							</div>
						</div>
						<label className="relative inline-flex items-center cursor-pointer shrink-0">
							<input type="checkbox" className="sr-only peer" checked={form.notifications} onChange={e => setForm({ ...form, notifications: e.target.checked })} />
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
						</label>
					</div>

					<div className="space-y-1">
						<label className="text-sm font-medium text-gray-700 flex items-center gap-2">
							<Send size={14} className="text-blue-500" /> Telegram username
						</label>
						<div className="flex items-center gap-2">
							<span className="text-gray-400 text-sm pl-2">@</span>
							<input
								placeholder="username"
								className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 min-h-[44px]"
								value={form.tg_username || ''}
								onChange={e => setForm({ ...form, tg_username: e.target.value.replace('@', '') })}
							/>
						</div>
						<p className="text-xs text-gray-500">Для получения уведомлений в Telegram (введите без @)</p>
					</div>
				</fieldset>

				{success && <p className="text-green-600 text-sm text-center font-medium bg-green-50 py-2 rounded-lg">{success}</p>}
				{error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}

				<button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200/50 min-h-[48px]">
					{loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Сохранить изменения
				</button>
			</form>
		</div>
	);
}