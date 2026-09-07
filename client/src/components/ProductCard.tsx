import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    description: string;
    price: number;
    size: string;
    condition: string;
    image_url: string;
    category: string;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 cursor-pointer border border-[#D2CBBF] flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="block group">
        <div className="h-64 overflow-hidden bg-gray-50">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-contain transition-transform group-hover:scale-110"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-[#26221C] truncate">{product.title}</h3>
            {product.size && (
              <span className="bg-[#D2CBBF] text-[#26221C] text-xs font-semibold px-2 py-1 rounded">
                {product.size}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 h-10">
            {product.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-[#26221C]">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-xs text-gray-500 italic">
              {product.condition}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-4 pt-0 mt-auto">
        <Link
          to={`/product/${product.id}`}
          className="block w-full text-center bg-[#26221C] text-white py-2 rounded-lg font-medium hover:bg-[#3d3830] transition-colors"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
};
