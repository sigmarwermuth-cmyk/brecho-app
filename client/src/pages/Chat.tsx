import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function Chat() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function setupChat() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // 1. Busca mensagens iniciais
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (data) setMessages(data);

      // 2. Inscrição em Tempo Real (REALTIME)
      const channel = supabase
        .channel(`chat:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    setupChat();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    const { error } = await supabase.from('messages').insert([
      {
        conversation_id: conversationId,
        sender_id: userId,
        content: newMessage,
      },
    ]);

    if (error) {
      alert('Erro ao enviar mensagem: ' + error.message);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-[#EDE8DD] flex flex-col">
      <header className="bg-white p-4 border-b border-[#D2CBBF] flex items-center gap-4">
        <div className="w-10 h-10 bg-[#26221C] rounded-full flex items-center justify-center text-white font-bold">
          💬
        </div>
        <h1 className="text-xl font-bold text-[#26221C]">Conversa sobre a Peça</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.sender_id === userId
                  ? 'bg-[#26221C] text-white rounded-tr-none'
                  : 'bg-white text-[#26221C] border border-[#D2CBBF] rounded-tl-none'
              }`}
            >
              <p>{msg.content}</p>
              <span className="text-[10px] opacity-70 block text-right mt-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-white border-t border-[#D2CBBF]">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#26221C]"
          />
          <button
            type="submit"
            className="bg-[#26221C] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#3d3830] transition-colors"
          >
            Enviar
          </button>
        </form>
      </footer>
    </div>
  );
}
