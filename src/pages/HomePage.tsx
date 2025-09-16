import React, { useEffect, useRef, useState } from 'react';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { Product } from '../types';

interface HomePageProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
}

const categories = [
  { id: 'all', name: 'Все', icon: '🛒' },
  { id: 'fruits', name: 'Фрукты', icon: '🍎' },
  { id: 'vegetables', name: 'Овощи', icon: '🥕' },
  { id: 'dairy', name: 'Молочное', icon: '🥛' },
  { id: 'meat', name: 'Мясо', icon: '🥩' },
  { id: 'bakery', name: 'Выпечка', icon: '🍞' }
];

const HomePage: React.FC<HomePageProps> = ({ products, onAddToCart }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCartFromModal = (product: Product, quantity: number) => {
    onAddToCart(product, quantity);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || products.length === 0) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.5;
    const cardWidth = 172; // 160px + 12px gap

    const scroll = () => {
      scrollAmount += scrollSpeed;
      const maxScroll = cardWidth * products.slice(-5).length;
      
      if (scrollAmount >= maxScroll) {
        scrollAmount = 0;
      }
      
      scrollContainer.scrollLeft = scrollAmount;
    };

    const interval = setInterval(scroll, 16); // ~60fps
    return () => clearInterval(interval);
  }, [products]);
  return (
    <div style={{ paddingTop: '24px' }}>
      <div className="container">
        {/* Hero Section with Latest Products */}
        <div style={{
          background: 'linear-gradient(135deg, #8b4513 0%, #6b3410 100%)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
          color: 'white'
        }}>

          
          {/* Latest Products Carousel */}
          {products.length > 0 && (
            <div 
              ref={scrollRef}
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'hidden',
                paddingBottom: '8px'
              }}
            >
              {/* Дублируем товары для бесконечной прокрутки */}
              {[...products.slice(-5), ...products.slice(-5)].map((product, index) => (

                <div 
                  key={`${product.id}-${index}`}
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
                    background: '#f9f5f0',
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
                onClick={() => handleCategoryClick(category.id)}
                style={{
                  textAlign: 'center',
                  padding: '8px 4px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  background: selectedCategory === category.id ? '#8b4513' : '#f9f5f0',
                  color: selectedCategory === category.id ? 'white' : '#3c2415'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ 
                  fontSize: window.innerWidth <= 768 ? '20px' : '24px', 
                  marginBottom: window.innerWidth <= 768 ? '4px' : '6px' 
                }}>
                  {category.icon}
                </div>
                <span style={{ 
                  fontSize: window.innerWidth <= 768 ? '10px' : '12px', 
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
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        </div>
        
        <ProductModal 
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToCart={handleAddToCartFromModal}
        />
      </div>
    </div>
  );
};

export default HomePage;