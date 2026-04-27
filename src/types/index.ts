export type UserRole = 'admin' | 'student';

export interface User {
	id: string;
	email: string;
	surname: string;
	name: string;
	patronym: string | null;
	birthDate: string | null;
	timezone: string | null;
	notifications: boolean | null;
	tgUsername: string | null;
	role: UserRole;
	isBanned: boolean;
	banReason: string | null;
	bannedAt: string | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface LoginRequest {
	email: string;
	password: string;
	deviceInfo?: string | null;
}

export interface RegistrationRequest {
	surname: string;
	name: string;
	patronym: string | null;
	birthDate: string | null;
	email: string;
	password: string;
	timezone: string | null;
	deviceInfo: string | null;
}

export interface UpdateProfileRequest {
	surname: string;
	name: string;
	patronym: string | null;
	birthDate: string | null;
	email: string;
	password: string | null;
	notifications: boolean | null;
	tgUsername: string | null;
	timezone: string | null;
}

export interface Course {
	id: string;
	userId: string;
	name: string | null;
	code: string | null;
	semester: string | null;
	credits: number | string | null;
	createdAt: string | null;
	updatedAt: string | null;
	deletedAt: string | null;
}

export interface Subtask {
	id: string;
	taskId: string;
	title: string | null;
	isCompleted: boolean | null;
	sortOrder: number | string | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface Task {
	id: string;
	title: string;
	description: string | null;
	deadline: string | null;
	priority: string | null;
	status: string | null;
}

export interface AddTaskRequest {
	title: string;
	description: string | null;
	deadline: string | null;
	priority: string | null;
	status: string | null;
}

export interface TrendItem {
	date: string;
	value: number | string;
}

export interface BanRequest {
	reason: string | null;
}