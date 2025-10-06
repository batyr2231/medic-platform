'use client';
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  text?: string;
  fileUrl?: string;
  createdAt: string;
  from: {
    id: string;
    name: string;
    role: string;
  };
}

interface ChatWindowProps {
  orderId: string;
  currentUserId: string;
}

export default function ChatWindow({ orderId, currentUserId }: ChatWindowProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl);
    setSocket(newSocket);
    newSocket.emit('join_order', orderId);
    newSocket.on('message_history', (history: Message[]) => {
      setMessages(history);
    });
    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });
    return () => {
      newSocket.disconnect();
    };
  }, [orderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;
    setSending(true);
    socket.emit('send_message', {
      orderId,
      fromUserId: currentUserId,
      text: newMessage,
    });
    setNewMessage('');
    setSending(false);
  };

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow">
      <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg">
        <h3 className="font-bold">Чат по заказу</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && <p className="text-center text-gray-500">Нет сообщений</p>}
        {messages.map((msg) => (
          <div key={msg.id} className={msg.from.id === currentUserId ? 'text-right' : 'text-left'}>
            <div className={msg.from.id === currentUserId ? 'bg-blue-600 text-white inline-block px-4 py-2 rounded-lg' : 'bg-gray-200 inline-block px-4 py-2 rounded-lg'}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-2 border rounded"
            disabled={sending}
          />
          <button type="submit" disabled={sending || !newMessage.trim()} className="px-6 py-2 bg-blue-600 text-white rounded">
            Отправить
          </button>
        </div>
      </form>
    </div>
  );
}