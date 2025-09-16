import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div className="card" style={{ 
      padding: '16px',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
    }}>
      <div style={{ 
        width: '100%',
        height: '160px',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '12px',
        background: '#f8f8f8',
        position: 'relative'
      }}>
        <img 
          src={product.image} 
          alt={product.name}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }}
        />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Plus size={16} color="#38b2ac" />
        </button>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600',
          marginBottom: '4px',
          lineHeight: '1.3'
        }}>
          {product.name}
        </h3>
        

      </div>

      <div>
        <span style={{ 
          fontSize: '18px', 
          fontWeight: '700',
          color: '#1a1a1a'
        }}>
          {product.price} ₽
        </span>
      </div>
    </div>
  );
};

export default ProductCard;