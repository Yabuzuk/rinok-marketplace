import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';
import { getDisplayPrice } from '../utils/priceUtils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
  onProductClick: (product: Product) => void;
  userRole?: string | null;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onProductClick, userRole }) => {
  const [imageError, setImageError] = useState(false);
  const displayPrice = getDisplayPrice(product.price, userRole);
  
  const getImageUrl = (image: string) => {
    if (!image) return null;
    // Если это уже полный URL
    if (image.startsWith('http')) return image;
    // Если это data URL
    if (image.startsWith('data:')) return image;
    // Если это имя файла (заканчивается на расширение)
    if (image.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return `http://100.127.227.15:8000/storage/v1/object/public/product-images/${image}`;
    }
    // Если это эмодзи или короткий текст - не URL
    return null;
  };
  
  const imageUrl = getImageUrl(product.image);
  const isEmoji = product.image && product.image.length <= 4 && !imageUrl;
  
  return (
    <div className="w-full">
      <div 
        className="relative w-full aspect-square rounded-lg overflow-hidden cursor-pointer"
        onClick={() => onProductClick(product)}
      >
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-3xl bg-slate-100">
            {isEmoji ? product.image : '📦'}
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
          {displayPrice} ₽
        </div>
        <h3 className="text-sm font-medium text-slate-900 line-clamp-2">
          {product.name}
        </h3>
      </div>
    </div>
  );
};

export default ProductCard;