import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

interface Conversation {
  id: string;
  product_id: number;
  buyer_id: string;
  seller_id: string;
}

interface Product {
  title: string;
  image_url: string;
}

export default function ChatList() {
  const [conversations, setConversations] = useState<{conv: Conversation, prod: Product}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChats() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Busca conversas onde o usuário é comprador ou vendedor
        const { data: convs, error: convErr } = await supabase
          .from('conversations')
          .select('*, products(*)')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

        if (convErr) throw convErr;

        const formatted = convs?.map(c => ({
          conv: { id: c.id, product_id: c.product_id, buyer_id: c.buyer_id, seller_id: c.seller_id },
          prod: c.products as unknown as Product
        })) || [];

        setConversations(formatted);
      } catch (err) {
        console.error('Erro ao carregar chats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDE8DD] text-[#26221C]">
        <p className="text-xl font-medium animate-pulse">Carregando suas conversas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDE8DD] p-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#26221C]">Minhas Conversas</h1>
          <p className="text-gray-600">Negocie suas peças favoritas aqui</p>
        </header>

        {conversations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D2CBBF] shadow-sm">
            <p className="text-xl text-gray-500">Você ainda não tem conversas ativas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map(({ conv, prod }) => (
              <Link
                key={conv.id}
                to={`/chat/${conv.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#D2CBBF] shadow-sm hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={prod.image_url}
                    alt={prod.title}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-bold text-[#26221C] group-hover:text-gray-800">{prod.title}</h3>
                    <p className="text-xs text-gray-500">Clique para abrir o chat</p>
                  </div>
                </div>
                <div className="text-[#26221C] font-bold">
                  →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
