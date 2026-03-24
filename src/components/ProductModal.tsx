import React, { useState } from 'react';
import { X, Plus, Minus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { getDisplayPrice } from '../utils/priceUtils';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  userRole?: string | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onAddToCart, userRole }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !product) return null;

  const displayPrice = getDisplayPrice(product.price, userRole);
  
  const getImageUrl = (image: string) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    if (image.startsWith('data:')) return image;
    if (image.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return `http://100.127.227.15:8000/storage/v1/object/public/product-images/${image}`;
    }
    return null;
  };
  
  const imageUrl = getImageUrl(product.image);
  const isEmoji = product.image && product.image.length <= 4 && !imageUrl;

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
          height: '200px',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '16px',
          background: '#f0e6d6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {imageUrl && !imageError ? (
            <img 
              src={imageUrl} 
              alt={product.name}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <div style={{ fontSize: '64px' }}>
              {isEmoji ? product.image : '📦'}
            </div>
          )}
        </div>

        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          marginBottom: '6px',
          color: '#2e7d32'
        }}>
          {product.name}
        </h2>



        <div style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#4caf50',
          marginBottom: '12px'
        }}>
          {displayPrice} ₽
        </div>

        <p style={{
          fontSize: '14px',
          lineHeight: '1.4',
          color: '#2e7d32',
          marginBottom: '16px'
        }}>
          {product.description}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '16px',
          padding: '12px',
          background: 'rgba(76, 175, 80, 0.1)',
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
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
              Павильон
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              {product.pavilionNumber || 'Не указан'}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
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

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-primary"
            onClick={handleAddToCart}
            style={{ 
              flex: 1,
              fontSize: '14px',
              padding: '10px'
            }}
          >
            Добавить в корзину • {(displayPrice * quantity).toLocaleString()} ₽
          </button>
          
          {product.pavilionNumber && (
            <button 
              onClick={() => {
                navigate(`/pavilion/${product.pavilionNumber}`);
                onClose();
              }}
              className="btn btn-secondary"
              style={{
                padding: '10px',
                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                color: 'white',
                border: 'none',
                fontSize: '20px'
              }}
              title={`Перейти в павильон ${product.pavilionNumber}`}
            >
              🏪
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;