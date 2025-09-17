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

  return (
    <div style={{
      minHeight: '100vh',
      background: `url('/images/Campo de grama de futebol verde _ Vetor Premium.jfif')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
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
                {/* Эффект травы под карточкой */}
                <div style={{
                  position: 'absolute',
                  bottom: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '130%',
                  height: '24px',
                  background: `
                    radial-gradient(ellipse at center, rgba(34, 139, 34, 0.6) 0%, rgba(34, 139, 34, 0.3) 50%, transparent 70%),
                    url("data:image/svg+xml,%3Csvg width='20' height='8' viewBox='0 0 20 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23228b22' fill-opacity='0.4'%3E%3Cpath d='M2 8c0-2 1-4 1-4s1 2 1 4zm4 0c0-2 1-4 1-4s1 2 1 4zm4 0c0-2 1-4 1-4s1 2 1 4zm4 0c0-2 1-4 1-4s1 2 1 4z'/%3E%3C/g%3E%3C/svg%3E")
                  `,
                  borderRadius: '50%',
                  zIndex: -1
                }} />
                
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
                  {seller.name}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail size={20} color="#4caf50" />
                  <span>{seller.email}</span>
                </div>
                
                {seller.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Phone size={20} color="#4caf50" />
                    <span>{seller.phone}</span>
                  </div>
                )}
                
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