import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { login, register, getMe } from '../api/client';
import type { User, RegistrationRequest } from '../types';

interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (data: RegistrationRequest) => Promise<void>;
	refreshUser: () => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const loadUser = async () => {
		try {
			const data = await getMe();
			setUser(data);
		} catch {
			localStorage.removeItem('token');
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (localStorage.getItem('token')) loadUser();
		else setIsLoading(false);
	}, []);

	const refreshUser = async () => {
		try { setUser(await getMe()); } catch (err) { console.error(err); }
	};

	const handleLogin = async (email: string, password: string) => {
		const deviceInfo = JSON.stringify({ ua: navigator.userAgent, lang: navigator.language, tz: Intl.DateTimeFormat().resolvedOptions().timeZone });
		const token = await login({ email, password, deviceInfo });
		localStorage.setItem('token', token);
		await loadUser();
	};

	const handleRegister = async (data: RegistrationRequest) => {
		const deviceInfo = JSON.stringify({ ua: navigator.userAgent, lang: navigator.language, tz: Intl.DateTimeFormat().resolvedOptions().timeZone });
		const payload = { ...data, deviceInfo };
		const token = await register(payload);
		localStorage.setItem('token', token);
		await loadUser();
	};

	const logout = () => {
		localStorage.removeItem('token');
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login: handleLogin, register: handleRegister, refreshUser, logout }}>
			{!isLoading && children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
	return ctx;
};
