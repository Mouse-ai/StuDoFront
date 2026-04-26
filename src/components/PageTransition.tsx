import { useEffect, useState, type ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
	const [mounted, setMounted] = useState(true);

	useEffect(() => {
		setMounted(true);
		return () => {
			const timer = setTimeout(() => setMounted(false), 50);
			return clearTimeout(timer);
		};
	}, []);

	if (!mounted) return null;

	return <div className="w-full animate-enter">{children}</div>;
}