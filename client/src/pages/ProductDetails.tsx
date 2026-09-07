import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  size: string;
  condition: string;
  image_url: string;
  category: string;
  user_id: string;
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatting, setChatting] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  const handleInterest = async () => {
    if (!product) return;
    setChatting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Você precisa estar logado para entrar em contato.');

      if (user.id === product.user_id) {
        throw new Error('Você é o vendedor deste produto!');
      }

      // 1. Verifica se já existe uma conversa entre este comprador e este produto
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('product_id', product.id)
        .eq('buyer_id', user.id)
        .single();

      let convId = existingConv?.id;

      // 2. Se não existir, cria uma nova conversa
      if (!convId) {
        const { data: newConv, error: convErr } = await supabase
          .from('conversations')
          .insert([
            {
              product_id: product.id,
              buyer_id: user.id,
              seller_id: product.user_id,
            },
          ])
          .select()
          .single();

        if (convErr) throw convErr;
        convId = newConv.id;
      }

      // 3. Redireciona para o chat
      navigate(`/chat/${convId}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setChatting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDE8DD] text-[#26221C]">
        <p className="text-xl font-medium animate-pulse">Carregando detalhes da peça...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDE8DD] text-red-600">
        <div className="text-center">
          <p className="text-xl mb-4">Produto não encontrado.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#26221C] text-white px-4 py-2 rounded-lg"
          >
            Voltar ao Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDE8DD] p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-[#26221C] font-medium hover:underline"
        >
          ← Voltar para o catálogo
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-sm border border-[#D2CBBF]">
          {/* Imagem */}
          <div className="rounded-2xl overflow-hidden h-[500px] bg-gray-50">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Detalhes */}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {product.category}
            </span>
            <h1 className="text-4xl font-bold text-[#26221C] mb-4">{product.title}</h1>

            <div className="flex gap-4 mb-6">
              {product.size && (
                <div className="bg-[#EDE8DD] px-3 py-1 rounded-full text-sm font-medium text-[#26221C]">
                  Tamanho: {product.size}
                </div>
              )}
              <div className="bg-[#EDE8DD] px-3 py-1 rounded-full text-sm font-medium text-[#26221C]">
                Estado: {product.condition}
              </div>
            </div>

            <p className="text-2xl font-bold text-[#26221C] mb-6">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#26221C] mb-2">Descrição</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mt-auto">
              <button
                onClick={handleInterest}
                disabled={chatting}
                className="w-full bg-[#26221C] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#3d3830] transition-colors shadow-lg disabled:bg-gray-400"
              >
                {chatting ? 'Conectando...' : 'Tenho Interesse'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                Ao clicar, você abrirá um chat privado com o vendedor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
