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
    // Подключаемся к Socket.IO
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Присоединяемся к комнате заказа
    newSocket.emit('join_order', orderId);

    // Слушаем историю сообщений
    newSocket.on('message_history', (history: Message[]) => {
      setMessages(history);
    });

    // Слушаем новые сообщения
    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Очистка при размонтировании
    return () => {
      newSocket.disconnect();
    };
  }, [orderId]);

  useEffect(() => {
    // Прокручиваем вниз при новых сообщениях
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
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
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      {/* Заголовок */}
      <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
        <h3 className="font-bold">Чат по заказу</h3>
        <p className="text-sm text-blue-100">ID: {orderId.slice(0, 8)}...</p>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Нет сообщений. Начните переписку!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.from.id === currentUserId;
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-medium mb-1 opacity-75">
                      {msg.from.name} ({msg.from.role === 'CLIENT' ? 'Клиент' : 'Медик'})
                    </p>
                  )}
                  <p className="text-sm">{msg.text}</p>
                  {msg.fileUrl && (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline"
                    >
                      Файл
                    </a>
                  )}
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Форма отправки */}
      <form onSubmit={sendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            Отправить
          </button>
        </div>
      </form>
    </div>
  );
}