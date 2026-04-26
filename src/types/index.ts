export interface User {
	id: string;
	email: string;
	name: string;
	surname: string;
	patronym?: string;
	birth_date?: string; // 👈 Было birthday
	notifications: boolean; // 👈 Новое поле
	tg_username?: string; // 👈 Новое поле
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

// 👇 Обновлён под новые поля
export interface RegisterRequest {
	surname: string;
	name: string;
	patronym: string;
	birth_date: string;
	email: string;
	password: string;
	notifications?: boolean;
	tg_username?: string;
}

// 👇 Отдельный тип для обновления профиля (все поля опциональны)
export interface UpdateProfileRequest {
	surname?: string;
	name?: string;
	patronym?: string | null;
	birth_date?: string | null;
	email?: string;
	password?: string;
	notifications?: boolean;
	tg_username?: string | null;
}