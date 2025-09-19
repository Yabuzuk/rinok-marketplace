import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin } from 'lucide-react';
import { Product, User as UserType } from '../types';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

interface PavilionPageProps {
  products: Product[];
  users: UserType[];
  onAddToCart: (product: Product, quantity?: number) => void;
}

const PavilionPage: React.FC<PavilionPageProps> = ({ products, users, onAddToCart }) => {
  const { pavilionNumber } = useParams<{ pavilionNumber: string }>();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSellerInfo, setShowSellerInfo] = useState(false);

  const pavilionProducts = products.filter(p => p.pavilionNumber === pavilionNumber);
  const seller = users.find(u => u.pavilionNumber === pavilionNumber && u.role === 'seller');
  
  // Проверяем активность продавца
  if (seller && seller.sellerActive !== true) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '48px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px', color: '#666' }}>
            Лавка не работает
          </h2>
          <p style={{ color: '#999', marginBottom: '24px' }}>
            Павильон {pavilionNumber} временно закрыт
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '100px',
      paddingBottom: '40px'
    }}>
      <div className="container">
        {/* Заголовок павильона */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '2px solid rgba(76, 175, 80, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#4caf50'
              }}
            >
              <ArrowLeft size={20} />
              Назад к каталогу
            </button>
            
            <button
              onClick={() => setShowSellerInfo(true)}
              className="btn btn-secondary"
              style={{
                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                color: 'white',
                border: 'none'
              }}
            >
              <User size={16} style={{ marginRight: '8px' }} />
              Данные продавца
            </button>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '8px'
            }}>
              🏪
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#2e7d32',
              marginBottom: '8px'
            }}>
              Павильон {pavilionNumber}
            </h1>
            <p style={{ color: '#666', fontSize: '16px' }}>
              {seller?.name || 'Продавец'} • {pavilionProducts.length} товаров
            </p>
          </div>
        </div>

        {/* Товары павильона */}
        {pavilionProducts.length > 0 ? (
          <div className="grid grid-4" style={{ gap: '24px' }}>
            {pavilionProducts.map(product => (
              <div
                key={product.id}
                style={{
                  transform: 'translateY(8px)',
                  filter: 'drop-shadow(0 4px 8px rgba(76, 175, 80, 0.2))',
                  position: 'relative'
                }}
              >

                
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onProductClick={setSelectedProduct}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            border: '2px dashed rgba(76, 175, 80, 0.3)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🌱</div>
            <h3 style={{ fontSize: '24px', color: '#666', marginBottom: '8px' }}>
              Павильон пуст
            </h3>
            <p style={{ color: '#999' }}>
              В этом павильоне пока нет товаров
            </p>
          </div>
        )}

        {/* Модальное окно товара */}
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={onAddToCart}
        />

        {/* Модальное окно информации о продавце */}
        {showSellerInfo && seller && (
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
              zIndex: 1000
            }}
            onClick={() => setShowSellerInfo(false)}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #f9f5f0 0%, #f1f8e9 100%)',
                borderRadius: '20px',
                padding: '32px',
                width: '400px',
                maxHeight: '80vh',
                overflowY: 'auto',
                border: '3px solid rgba(76, 175, 80, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: '600',
                  margin: '0 auto 16px'
                }}>
                  {seller.name?.charAt(0)?.toUpperCase() || 'П'}
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#2e7d32' }}>
                  {seller.companyName || seller.name}
                </h3>
                {seller.companyName && seller.companyName !== seller.name && (
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    Владелец: {seller.name}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={20} color="#4caf50" />
                  <span>Павильон {seller.pavilionNumber}</span>
                </div>
                
                {seller.inn && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: '600', color: '#4caf50' }}>ИНН:</span>
                    <span>{seller.inn}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowSellerInfo(false)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '24px',
                  background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                  border: 'none'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PavilionPage;