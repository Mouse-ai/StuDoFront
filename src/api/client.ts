import type { AdminOverview, AiUsageItem, RoleDistributionItem, TrendItem, User } from "../types";

const IS_LOCALHOST = false;
const PORT = 5245;
const BASE_URL = IS_LOCALHOST ? `http://localhost:${PORT}` : 'https://studoback.up.railway.app';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	const token = localStorage.getItem('token');
	const headers = new Headers(options.headers);

	if (token) headers.set('Authorization', `Bearer ${token}`);
	if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

	const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

	if (!response.ok) {
		const errText = await response.text().catch(() => '');
		throw new Error(errText || `API Error: ${response.status}`);
	}

	if (response.status === 204 || response.headers.get('content-length') === '0') {
		return undefined as T;
	}

	const text = await response.text();
	try {
		return JSON.parse(text) as T;
	} catch {
		return text as unknown as T;
	}
}

export async function getAiKey(): Promise<string> {
	return apiFetch<string>('/api/Ai/key');
}

export async function getAdminUsers(search = '', page = 1, size = 20) {
	return apiFetch<{ users: User[]; total: number; page: number; size: number }>(`/api/Admin/users?page=${page}&search=${search}&size=${size}`);
}

export async function getAdminOverview(): Promise<AdminOverview | null> {
	return apiFetch('/api/Admin/analytics/overview');
}

export async function getAdminTasksTrend(days = 7): Promise<TrendItem[]> {
	return apiFetch(`/api/Admin/analytics/tasks-trend?days=${days}`);
}

export async function getAdminAiUsage(days = 7): Promise<AiUsageItem[]> {
	return apiFetch(`/api/Admin/analytics/ai-usage?days=${days}`);
}

export async function getAdminRoles(): Promise<RoleDistributionItem[]> {
	return apiFetch('/api/Admin/analytics/roles');
}