import React, { useState } from 'react';
import { X, Plus, Minus, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    if (quantity < product.minOrderQuantity) {
      alert(`Минимальное количество для заказа: ${product.minOrderQuantity} кг`);
      return;
    }
    onAddToCart(product, quantity);
    onClose();
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#f9f5f0',
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            padding: '8px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          width: '100%',
          height: '300px',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '20px',
          background: '#f0e6d6'
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

        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '8px',
          color: '#3c2415'
        }}>
          {product.name}
        </h2>



        <div style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#8b4513',
          marginBottom: '16px'
        }}>
          {product.price} ₽
        </div>

        <p style={{
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#3c2415',
          marginBottom: '20px'
        }}>
          {product.description}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '20px',
          padding: '16px',
          background: 'rgba(139, 69, 19, 0.1)',
          borderRadius: '8px'
        }}>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
              В наличии
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              {product.stock} кг
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
              Мин. заказ
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              {product.minOrderQuantity} кг
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '16px', fontWeight: '600' }}>
            Количество:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={decreaseQuantity}
              style={{
                width: '36px',
                height: '36px',
                border: '1px solid #d4c4b0',
                background: '#f9f5f0',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value) || 1;
                if (newQuantity >= 1 && newQuantity <= product.stock) {
                  setQuantity(newQuantity);
                }
              }}
              style={{
                width: '60px',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: '600',
                border: '1px solid #d4c4b0',
                borderRadius: '6px',
                padding: '4px'
              }}
            />
            <button 
              onClick={increaseQuantity}
              style={{
                width: '36px',
                height: '36px',
                border: '1px solid #d4c4b0',
                background: '#f9f5f0',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {quantity < product.minOrderQuantity && (
          <div style={{
            padding: '12px',
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#d32f2f'
          }}>
            Минимальное количество для заказа: {product.minOrderQuantity} кг
          </div>
        )}

        <button 
          className="btn btn-primary"
          onClick={handleAddToCart}
          style={{ 
            width: '100%',
            fontSize: '16px',
            padding: '12px'
          }}
        >
          Добавить в корзину • {(product.price * quantity).toLocaleString()} ₽
        </button>
      </div>
    </div>
  );
};

export default ProductModal;