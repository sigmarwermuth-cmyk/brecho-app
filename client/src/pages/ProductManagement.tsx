import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  title: string;
  price: number;
  image_url: string;
  created_at: string;
}

export default function ProductManagement() {
  const navigate = useNavigate();
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyProducts() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMyProducts(data || []);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyProducts();
  }, []);

  const handleRemove = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este anúncio?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      setMyProducts(prev => prev.filter(p => p.id !== id));
      alert('Produto removido com sucesso!');
    } catch (err: any) {
      alert('Erro ao remover produto: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDE8DD] text-[#26221C]">
        <p className="text-xl font-medium animate-pulse">Carregando seus produtos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDE8DD] p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#26221C]">Meus Anúncios</h1>
            <p className="text-gray-600">Gerencie as peças que você colocou à venda</p>
          </div>
          <button
            onClick={() => navigate('/add-product')}
            className="bg-[#26221C] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3d3830] transition-colors"
          >
            + Novo Produto
          </button>
        </header>

        {myProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D2CBBF] shadow-sm">
            <p className="text-xl text-gray-500 mb-4">Você ainda não possui anúncios ativos.</p>
            <button
              onClick={() => navigate('/add-product')}
              className="text-[#26221C] font-bold underline hover:text-gray-800"
            >
              Comece a vender agora!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myProducts.map(product => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-2xl border border-[#D2CBBF] shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-bold text-[#26221C]">{product.title}</h3>
                    <p className="text-sm text-gray-500">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                  title="Remover Produto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM14 16a2 2 0 11-4 0 2 2 0 014 0zm-5-11V4a1 1 0 112 0v1h-2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
