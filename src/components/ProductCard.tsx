import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
  onProductClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onProductClick }) => {
  return (
    <div className="w-full">
      <div 
        className="relative w-full aspect-square rounded-lg overflow-hidden cursor-pointer"
        onClick={() => onProductClick(product)}
      >
        {product.image && (product.image.startsWith('http') || product.image.startsWith('data:')) ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full text-3xl">📦</div>';
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-3xl">
            {product.image || '📦'}
          </div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 hover:bg-white hover:scale-110 transition-all flex items-center justify-center shadow-sm"
        >
          <Plus size={16} className="text-slate-700" strokeWidth={2.5} />
        </button>
      </div>

      <div className="mt-2">
        <div className="text-sm font-semibold text-violet-600 mb-1">
          {product.price} ₽
        </div>
        <h3 className="text-sm font-medium text-slate-900 line-clamp-2">
          {product.name}
        </h3>
      </div>
    </div>
  );
};

export default ProductCard;