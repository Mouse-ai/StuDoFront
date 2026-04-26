import { useState } from 'react';
import type { ChatMessage } from '../types';
import { Send, Bot, User } from 'lucide-react';

export function AIChat() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);

	const apiKey = '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';

	const sendMessage = async () => {
		if (!input.trim() || loading) return;
		const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: input };
		setMessages(prev => [...prev, userMsg]);
		setInput('');
		setLoading(true);

		try {
			const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${apiKey}`,
					'HTTP-Referer': window.location.origin,
					'X-Title': 'StuDo'
				},
				body: JSON.stringify({
					model: 'meta-llama/llama-3.3-70b-instruct',
					messages: [
						{ role: 'system', content: 'Ты учебный ассистент. Помогай студентам планировать задачи, объяснять материал и мотивировать. Отвечай кратко и по делу.' },
						...messages.map(m => ({ role: m.role, content: m.content })),
						{ role: 'user', content: input }
					]
				})
			});

			const data = await response.json();
			const assistantMsg: ChatMessage = {
				id: crypto.randomUUID(),
				role: 'assistant',
				content: data.choices?.[0]?.message?.content || 'Ошибка получения ответа.'
			};
			setMessages(prev => [...prev, assistantMsg]);
		} catch (err) {
			console.error(err);
			setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Не удалось связаться с ИИ. Проверьте подключение или ключ.' }]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white rounded-xl shadow p-6 flex flex-col h-full">
			<h2 className="text-xl font-bold mb-4 flex items-center gap-2">🤖 AI-ассистент</h2>
			<div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-40 max-h-64">
				{messages.map(msg => (
					<div key={msg.id} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
						<div className={`p-2 rounded-full ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
							{msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
						</div>
						<div className={`p-3 rounded-lg max-w-xs text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
							{msg.content}
						</div>
					</div>
				))}
			</div>
			<div className="flex gap-2">
				<input
					type="text"
					placeholder="Спроси о дедлайне, теме или плане..."
					className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
					value={input}
					onChange={e => setInput(e.target.value)}
					onKeyDown={e => e.key === 'Enter' && sendMessage()}
				/>
				<button onClick={sendMessage} disabled={loading} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 disabled:opacity-50">
					<Send size={18} />
				</button>
			</div>
		</div>
	);
}