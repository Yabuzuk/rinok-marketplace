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
  { id: 'dairy', name: 'Молочные', icon: '🥛' },
  { id: 'meat', name: 'Мясо', icon: '🥩' },
  { id: 'bakery', name: 'Хлеб', icon: '🍞' },
  { id: 'drinks', name: 'Напитки', icon: '🥤' }
];

const HomePage: React.FC<HomePageProps> = ({ products, onAddToCart }) => {
  return (
    <div style={{ paddingTop: '24px' }}>
      <div className="container">
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #4fd1c7 0%, #38b2ac 100%)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '32px',
          color: 'white'
        }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700',
            marginBottom: '12px'
          }}>
            Быстрая доставка продуктов
          </h1>
          <p style={{ 
            fontSize: '18px',
            opacity: 0.9,
            marginBottom: '24px'
          }}>
            Свежие продукты к вашему столу за 15 минут
          </p>
          <button className="btn" style={{
            background: '#fefcf8',
            color: '#38b2ac',
            fontWeight: '600'
          }}>
            Заказать сейчас
          </button>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px'
          }}>
            {categories.map(category => (
              <div 
                key={category.id}
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '20px 16px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {category.icon}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
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