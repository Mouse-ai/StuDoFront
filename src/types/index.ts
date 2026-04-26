export type UserRole = 'student' | 'admin'

export interface User {
	id: string;
	email: string;
	name: string;
	surname: string;
	patronym?: string;
	birthDate?: string;
	notifications: boolean;
	tgUsername?: string;
	timezone: string;
	role: UserRole
}

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export interface Task {
	id: string;
	title: string;
	subject: string;
	deadline: string;
	completed: boolean;
	chatHistory: ChatMessage[];
}

export type AuthTab = 'login' | 'register';

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	surname: string;
	name: string;
	patronym: string;
	birthDate: string;
	email: string;
	password: string;
	notifications?: boolean;
	tgUsername?: string;
	timezone: string;
}

export interface UpdateProfileRequest {
	surname?: string;
	name?: string;
	patronym?: string | null;
	birthDate?: string | null;
	email?: string;
	password?: string;
	notifications?: boolean;
	tgUsername?: string | null;
	timezone: string;
}

export interface AdminOverview {
	totalUsers: number;
	activeTasks: number;
	aiRequestsToday: number;
	completionRate: number;
}

export interface TrendItem {
	date: string;
	value: number;
}

export interface AiUsageItem {
	date: string;
	requests: number;
	tokens: number;
}

export interface RoleDistributionItem {
	name: string;
	value: number;
}