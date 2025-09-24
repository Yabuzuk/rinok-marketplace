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
    <div 
      style={{ 
        cursor: 'pointer',
        transition: 'transform 0.2s ease'
      }}
      onClick={() => onProductClick(product)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <div style={{ 
        width: '100%',
        aspectRatio: '1',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '4px',
        background: '#f8f8f8',
        position: 'relative'
      }}>
        {product.image && (product.image.startsWith('http') || product.image.startsWith('data:')) ? (
          <img 
            src={product.image} 
            alt={product.name}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 32px; background: #f0f0f0;">📦</div>';
              }
            }}
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            fontSize: '32px',
            background: '#f0f0f0'
          }}>
            {product.image || '📦'}
          </div>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          style={{
            position: 'absolute',
            bottom: '6px',
            right: '6px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Plus size={18} color="#4caf50" strokeWidth={3} />
        </button>
      </div>

      <div style={{ textAlign: 'left' }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '300',
          color: '#e53e3e',
          margin: '0 0 2px 0'
        }}>
          {product.price} ₽
        </div>
        <h3 style={{ 
          fontSize: '12px', 
          fontWeight: '300',
          lineHeight: '1.2',
          margin: 0,
          color: '#333'
        }}>
          {product.name}
        </h3>
      </div>
    </div>
  );
};

export default ProductCard;