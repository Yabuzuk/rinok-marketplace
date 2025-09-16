import React from 'react';
import { Plus, Star } from 'lucide-react';
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
        background: '#f8f8f8'
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
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          marginBottom: '8px'
        }}>
          <Star size={14} fill="#ffd700" color="#ffd700" />
          <span style={{ fontSize: '14px', color: '#666' }}>
            {product.rating} ({product.reviews})
          </span>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between'
      }}>
        <div>
          <span style={{ 
            fontSize: '18px', 
            fontWeight: '700',
            color: '#1a1a1a'
          }}>
            {product.price} ₽
          </span>
        </div>

        <button 
          className="btn btn-primary"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          style={{ 
            padding: '8px 12px',
            fontSize: '14px',
            minWidth: 'auto'
          }}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;