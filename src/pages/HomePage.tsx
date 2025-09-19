import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { Product } from '../types';

interface HomePageProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  users?: any[];
}

const categories = [
  { id: 'all', name: 'Все', icon: '🛒' },
  { id: 'fruits', name: 'Фрукты', icon: '🍎' },
  { id: 'vegetables', name: 'Овощи', icon: '🥕' },
  { id: 'greens', name: 'Зелень', icon: '🥬' },
  { id: 'berries', name: 'Ягоды', icon: '🍓' },
  { id: 'nuts', name: 'Орехи', icon: '🥜' },
  { id: 'spices', name: 'Специи', icon: '🌶️' },
  { id: 'pavilion', name: 'Павильон', icon: '🏢' }
];

const HomePage: React.FC<HomePageProps> = ({ products, onAddToCart, users = [] }) => {
  console.log('HomePage products:', products?.length || 0);
  const navigate = useNavigate();
  
  // Отладка: показываем данные о продавцах и товарах
  console.log('=== DEBUG INFO ===');
  console.log('Users:', users.length, users.map(u => ({ id: u.id, name: u.name, role: u.role, pavilion: u.pavilionNumber, sellerActive: u.sellerActive })));
  console.log('Products:', products.length, products.map(p => ({ name: p.name, sellerId: p.sellerId, pavilion: p.pavilionNumber })));
  
  // Фильтруем товары только от активных продавцов
  const activeProducts = products.filter(product => {
    // Поиск продавца по ID или по номеру павильона
    const seller = users.find(u => 
      String(u.id) === String(product.sellerId) || 
      (u.pavilionNumber === product.pavilionNumber && u.role === 'seller')
    );
    console.log('Product:', product.name, 'sellerId:', product.sellerId, 'Seller found:', seller?.name, 'Active:', seller?.sellerActive);
    return seller && seller.sellerActive === true;
  });
  
  console.log('Active products after filter:', activeProducts.length);
  console.log('==================');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPavilion, setSelectedPavilion] = useState<string>('all');
  const [showPavilionFilter, setShowPavilionFilter] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCartFromModal = (product: Product, quantity: number) => {
    onAddToCart(product, quantity);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'pavilion') {
      setShowPavilionFilter(true);
      return;
    }
    setSelectedCategory(categoryId);
    setShowPavilionFilter(false);
    setSelectedPavilion('all');
  };

  const handlePavilionClick = (pavilionNumber: string) => {
    setSelectedPavilion(pavilionNumber);
  };

  const filteredProducts = (() => {
    if (showPavilionFilter) {
      if (selectedPavilion === 'all') {
        return activeProducts;
      }
      return activeProducts.filter(product => 
        product.pavilionNumber === selectedPavilion
      );
    }
    
    return selectedCategory === 'all' 
      ? activeProducts 
      : activeProducts.filter(product => product.category === selectedCategory);
  })();

  // Получаем уникальные номера павильонов из активных товаров
  const pavilionNumbers = activeProducts
    .filter(p => p.pavilionNumber)
    .map(p => p.pavilionNumber);
  const pavilions = pavilionNumbers
    .filter((num, index) => pavilionNumbers.indexOf(num) === index)
    .sort();

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
    <div style={{
      minHeight: '100vh',
      paddingTop: '24px'
    }}>
      <div className="container">
        {/* Hero Section with Latest Products */}
        <div style={{
          background: '#f1f8e9',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 2px 8px rgba(46, 125, 50, 0.1)',
          border: '1px solid #c8e6c9'
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
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
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
                    {product.image && (product.image.startsWith('http') || product.image.startsWith('data:')) ? (
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
                    textAlign: 'center',
                    color: '#4caf50'
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

          
          {showPavilionFilter && (
            <div style={{ marginBottom: '16px' }}>
              <button 
                onClick={() => {
                  setShowPavilionFilter(false);
                  setSelectedCategory('all');
                  setSelectedPavilion('all');
                }}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  color: '#2e7d32',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                ← Назад к категориям
              </button>
            </div>
          )}
          <div className="grid grid-6" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))',
            gap: '8px'
          }}>
            {showPavilionFilter ? (
              <>
                <div 
                  className="card"
                  onClick={() => handlePavilionClick('all')}
                  style={{
                    textAlign: 'center',
                    padding: '8px 4px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    background: selectedPavilion === 'all' ? '#4caf50' : '#f1f8e9',
                    color: selectedPavilion === 'all' ? 'white' : '#2e7d32'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '20px' : '24px', 
                    marginBottom: window.innerWidth <= 768 ? '4px' : '6px' 
                  }}>
                    🛒
                  </div>
                  <span style={{ 
                    fontSize: window.innerWidth <= 768 ? '10px' : '12px', 
                    fontWeight: '500' 
                  }}>
                    Все
                  </span>
                </div>
                {pavilions.map(pavilion => (
                  <div key={pavilion} style={{ position: 'relative' }}>
                    <div 
                      className="card"
                      onClick={() => handlePavilionClick(pavilion)}
                      style={{
                        textAlign: 'center',
                        padding: '8px 4px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        background: selectedPavilion === pavilion ? '#4caf50' : '#f1f8e9',
                        color: selectedPavilion === pavilion ? 'white' : '#2e7d32'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ 
                        fontSize: window.innerWidth <= 768 ? '20px' : '24px', 
                        marginBottom: window.innerWidth <= 768 ? '4px' : '6px' 
                      }}>
                        🏢
                      </div>
                      <span style={{ 
                        fontSize: window.innerWidth <= 768 ? '10px' : '12px', 
                        fontWeight: '500' 
                      }}>
                        {pavilion}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/pavilion/${pavilion}`);
                      }}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                        color: 'white',
                        fontSize: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Открыть лавку"
                    >
                      🏪
                    </button>
                  </div>
                ))}
              </>
            ) : (
              categories.map(category => (
                <div 
                  key={category.id}
                  className="card"
                  onClick={() => handleCategoryClick(category.id)}
                  style={{
                    textAlign: 'center',
                    padding: '8px 4px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    background: selectedCategory === category.id && !showPavilionFilter ? '#4caf50' : '#f1f8e9',
                    color: selectedCategory === category.id && !showPavilionFilter ? 'white' : '#2e7d32'
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
              ))
            )}
          </div>
        </div>

        {/* Products */}
        <div>

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