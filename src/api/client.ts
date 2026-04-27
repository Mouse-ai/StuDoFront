import type { LoginRequest, RegistrationRequest, User, UpdateProfileRequest, Task, AddTaskRequest, Subtask, Course, TrendItem } from "../types";

const BASE_URL = 'https://studoback.up.railway.app';

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
	if (response.status === 204 || response.headers.get('content-length') === '0') return undefined as T;
	const text = await response.text();
	try { return JSON.parse(text) as T; } catch { return text as unknown as T; }
}

export async function login(data: LoginRequest) {
	return apiFetch<string>('/api/Auth/login', { method: 'POST', body: JSON.stringify(data) });
}

export async function register(data: RegistrationRequest) {
	return apiFetch<string>('/api/Auth/register', { method: 'POST', body: JSON.stringify(data) });
}

export async function getMe() { return apiFetch<User>('/api/Auth/me'); }

export async function updateMe(data: UpdateProfileRequest) {
	return apiFetch('/api/Auth/me', { method: 'PUT', body: JSON.stringify(data) });
}

export async function getAiKey() { return apiFetch<string>('/api/AI/key'); }
export async function getAiModel() { return apiFetch<string>('/api/AI/model'); }

export async function getTasks() { return (await apiFetch<Task[]>('/api/Tasks')); }
export async function createTask(data: AddTaskRequest) { return apiFetch<Task>('/api/Tasks/addtask', { method: 'POST', body: JSON.stringify(data) }); }
export async function updateTask(id: string, data: AddTaskRequest) { return apiFetch(`/api/Tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export async function deleteTask(id: string) { return apiFetch(`/api/Tasks/${id}`, { method: 'DELETE' }); }

export async function getSubtasks() { return apiFetch<Subtask[]>('/api/Subtasks'); }
export async function createSubtask(data: Subtask) { return apiFetch<Subtask>('/api/Subtasks', { method: 'POST', body: JSON.stringify(data) }); }
export async function updateSubtask(id: string, data: Partial<Subtask>) { return apiFetch(`/api/Subtasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export async function deleteSubtask(id: string) { return apiFetch(`/api/Subtasks/${id}`, { method: 'DELETE' }); }

export async function getCourses() { return apiFetch<Course[]>('/api/Courses'); }
export async function createCourse(data: Partial<Course>) { return apiFetch<Course>('/api/Courses', { method: 'POST', body: JSON.stringify(data) }); }
export async function updateCourse(id: string, data: Course) { return apiFetch(`/api/Courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export async function deleteCourse(id: string) { return apiFetch(`/api/Courses/${id}`, { method: 'DELETE' }); }

export async function getAdminUsers(search = '', page = 1, size = 20) {
	return apiFetch<{ users: User[]; total: number }>(`/api/Admin/users?search=${search}&page=${page}&size=${size}`);
}
export async function getAdminOverview() { return apiFetch('/api/Admin/analytics/overview'); }
export async function getAdminTasksTrend(days = 7) { return apiFetch<TrendItem[]>(`/api/Admin/analytics/tasks-trend?days=${days}`); }
export async function getAdminAiUsage(days = 7) { return apiFetch(`/api/Admin/analytics/ai-usage?days=${days}`); }
export async function getAdminRoles() { return apiFetch('/api/Admin/analytics/roles'); }
export async function banUser(id: string, reason: string) { return apiFetch(`/api/Admin/users/${id}/ban`, { method: 'PUT', body: JSON.stringify({ reason }) }); }
export async function unbanUser(id: string) { return apiFetch(`/api/Admin/users/${id}/unban`, { method: 'PUT' }); }

export async function logAiRequest(data: {
	model: string;
	promptTokens?: number;
	completionTokens?: number;
	totalTokens?: number;
	status: 'success' | 'error' | 'fail';
	taskId?: string;
	errorMessage?: string;
}) {
	try {
		await apiFetch('/api/AI/log', {
			method: 'POST',
			body: JSON.stringify({
				model: data.model,
				promptTokens: data.promptTokens,
				completionTokens: data.completionTokens,
				totalTokens: data.totalTokens,
				status: data.status === 'error' ? 'fail' : data.status,
				taskId: data.taskId,
				errorMessage: data.errorMessage
			})
		});
	} catch {
		console.warn('AI log failed (non-critical)');
	}
}