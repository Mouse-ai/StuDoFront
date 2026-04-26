import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, BookOpen, Brain, TrendingUp } from 'lucide-react';
import { getAdminOverview, getAdminTasksTrend, getAdminAiUsage } from '../api/client';
import type { AdminOverview, TrendItem, AiUsageItem } from '../types';

export function AdminDashboard() {
	const [overview, setOverview] = useState<AdminOverview | null>(null);
	const [tasksTrend, setTasksTrend] = useState<TrendItem[]>([]);
	const [aiUsage, setAiUsage] = useState<AiUsageItem[]>([]);

	useEffect(() => {
		getAdminOverview().then(setOverview);
		getAdminTasksTrend().then(setTasksTrend);
		getAdminAiUsage().then(setAiUsage);
	}, []);

	if (!overview) return <div className="flex justify-center pt-10 text-gray-500">Загрузка...</div>;

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			<h2 className="text-2xl font-bold text-gray-900">Обзор системы</h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{ label: 'Всего пользователей', value: overview.totalUsers, icon: Users, color: 'bg-blue-100 text-blue-600' },
					{ label: 'Активных задач', value: overview.activeTasks, icon: BookOpen, color: 'bg-green-100 text-green-600' },
					{ label: 'AI-запросов сегодня', value: overview.aiRequestsToday, icon: Brain, color: 'bg-purple-100 text-purple-600' },
					{ label: 'Процент выполнения', value: `${overview.completionRate}%`, icon: TrendingUp, color: 'bg-orange-100 text-orange-600' }
				].map((stat, i) => (
					<div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500">{stat.label}</p>
							<p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
						</div>
						<div className={`p-3 rounded-xl ${stat.color}`}><stat.icon size={20} /></div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
					<h3 className="text-lg font-bold mb-4">Динамика задач</h3>
					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={tasksTrend}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip />
								<Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
					<h3 className="text-lg font-bold mb-4">Использование AI</h3>
					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={aiUsage}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="requests" fill="#10b981" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>
		</div>
	);
}