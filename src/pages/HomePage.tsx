import React from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

interface HomePageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const categories = [
  { id: 'fruits', name: 'Фрукты', icon: '🍎' },
  { id: 'vegetables', name: 'Овощи', icon: '🥕' },
  { id: 'spices', name: 'Специи', icon: '🌶️' }
];

const HomePage: React.FC<HomePageProps> = ({ products, onAddToCart }) => {
  return (
    <div style={{ paddingTop: '24px' }}>
      <div className="container">
        {/* Hero Section with Latest Products */}
        <div style={{
          background: 'linear-gradient(135deg, #4fd1c7 0%, #38b2ac 100%)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
          color: 'white'
        }}>

          
          {/* Latest Products Carousel */}
          {products.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px'
            }}>
              {products.slice(-5).map(product => (
                <div 
                  key={product.id}
                  style={{
                    minWidth: '160px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => onAddToCart(product)}
                >
                  <div style={{
                    width: '130px',
                    height: '130px',
                    background: '#fefcf8',
                    borderRadius: '16px',
                    margin: '0 auto 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '42px',
                    overflow: 'hidden'
                  }}>
                    {product.image && product.image.startsWith('http') ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '16px'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerHTML = '📦';
                          }
                        }}
                      />
                    ) : (
                      product.image || '📦'
                    )}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    textAlign: 'center'
                  }}>
                    {product.price} ₽
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            Категории
          </h2>
          <div className="grid grid-6" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))',
            gap: '8px'
          }}>
            {categories.map(category => (
              <div 
                key={category.id}
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '8px 4px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ 
                  fontSize: window.innerWidth <= 768 ? '20px' : '16px', 
                  marginBottom: window.innerWidth <= 768 ? '4px' : '3px' 
                }}>
                  {category.icon}
                </div>
                <span style={{ 
                  fontSize: window.innerWidth <= 768 ? '10px' : '8px', 
                  fontWeight: '500' 
                }}>
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            Популярные товары
          </h2>
          <div className="grid grid-4">
            {products.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;