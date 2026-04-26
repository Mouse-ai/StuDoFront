import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiFetch } from '../api/client';
import type { User, RegisterRequest } from '../types';

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (data: RegisterRequest) => Promise<void>;
	refreshUser: () => Promise<void>; // 👈 Новый метод
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const loadUser = async () => {
		try {
			const data = await apiFetch<User>('/api/Auth/me');
			setUser(data);
		} catch {
			localStorage.removeItem('token');
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) loadUser();
		else setIsLoading(false);
	}, []);

	const refreshUser = async () => {
		try {
			const data = await apiFetch<User>('/api/Auth/me');
			setUser(data);
		} catch (err) {
			console.error('Failed to refresh user profile:', err);
		}
	};

	const login = async (email: string, password: string) => {
		const res = await apiFetch<{ token?: string; accessToken?: string } | string>('/api/Auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password })
		});
		const token = typeof res === 'string' ? res : (res?.token || res?.accessToken);
		if (!token) throw new Error('Токен не получен от сервера');
		localStorage.setItem('token', token);
		await loadUser();
	};

	const register = async (data: RegisterRequest) => {
		const res = await apiFetch<{ token?: string; accessToken?: string } | string>('/api/Auth/register', {
			method: 'POST',
			body: JSON.stringify({
				surname: data.surname,
				name: data.name,
				patronym: data.patronym || null,
				birth_date: data.birth_date || null,
				email: data.email,
				password: data.password,
				timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
			})
		});
		const token = typeof res === 'string' ? res : (res?.token || res?.accessToken);
		if (token) {
			localStorage.setItem('token', token);
			await loadUser();
		} else {
			throw new Error('Регистрация успешна. Теперь войдите.');
		}
	};

	const logout = () => {
		localStorage.removeItem('token');
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, refreshUser, logout }}>
			{!isLoading && children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
	return ctx;
};