import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import { Product } from '../types';

interface HomePageProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  users?: any[];
  userRole?: string | null;
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

const HomePage: React.FC<HomePageProps> = ({ products, onAddToCart, users = [], userRole }) => {
  const navigate = useNavigate();
  
  // Фильтруем товары только от активных продавцов и с наличием на складе
  const activeProducts = products.filter(product => {
    const seller = users.find(u => 
      String(u.id) === String(product.sellerId) || 
      (u.pavilionNumber === product.pavilionNumber && u.role === 'seller')
    );
    return seller && seller.sellerActive === true && product.stock > 0;
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPavilion, setSelectedPavilion] = useState<string>('all');
  const [showCategories, setShowCategories] = useState(false);
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
    <div className="min-h-screen pt-6 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 space-y-6">

        {/* Banner */}
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <img 
            src="/banner.jpg" 
            alt="ОптБазар" 
            className="w-full h-auto"
            style={{ maxHeight: '200px', objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col items-center justify-end pb-6 px-4">
            <div className="text-center mb-4">
              <h2 className="text-white text-lg md:text-2xl font-bold mb-1 drop-shadow-lg">
                Больше знаешь — меньше чек!
              </h2>
              <p className="text-white/90 text-sm drop-shadow-md">
                Наши советы для умных покупок и экономии
              </p>
            </div>
            <div className="flex gap-3">
              <a 
                href="/zakaz/" 
                className="px-6 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors shadow-lg"
              >
                О покупках
              </a>
              <a 
                href="/dostavka/" 
                className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg"
              >
                О доставке
              </a>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-violet-600 transition-colors py-0"
            >
              Категории
              <span className={`transform transition-transform ${showCategories ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showPavilionFilter && (
              <button 
                onClick={() => {
                  setShowPavilionFilter(false);
                  setSelectedCategory('all');
                  setSelectedPavilion('all');
                }}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
              >
                ← Все категории
              </button>
            )}
          </div>
          
          {showCategories && (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {showPavilionFilter ? (
                <>
                  <button 
                    onClick={() => handlePavilionClick('all')}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      selectedPavilion === 'all' 
                        ? 'bg-violet-100 border-violet-200 text-violet-700' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-lg mb-1">🛒</div>
                    <div className="text-xs font-medium">Все</div>
                  </button>
                  {pavilions.map(pavilion => (
                    <div key={pavilion} className="relative">
                      <button 
                        onClick={() => handlePavilionClick(pavilion)}
                        className={`w-full p-3 rounded-lg border transition-all text-center ${
                          selectedPavilion === pavilion 
                            ? 'bg-violet-100 border-violet-200 text-violet-700' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-lg mb-1">🏢</div>
                        <div className="text-xs font-medium">{pavilion}</div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pavilion/${pavilion}`);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center hover:bg-violet-700 transition-colors"
                        title="Открыть лавку"
                      >
                        →
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                categories.map(category => (
                  <button 
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`p-3 rounded-lg border transition-all text-center ${
                      selectedCategory === category.id && !showPavilionFilter
                        ? 'bg-violet-100 border-violet-200 text-violet-700' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-lg mb-1">{category.icon}</div>
                    <div className="text-xs font-medium">{category.name}</div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Products */}
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            {showPavilionFilter 
              ? `Товары ${selectedPavilion === 'all' ? 'всех павильонов' : `павильона ${selectedPavilion}`}` 
              : `${selectedCategory === 'all' ? 'Все товары' : categories.find(c => c.id === selectedCategory)?.name}`} 
            ({filteredProducts.length})
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onProductClick={handleProductClick}
                userRole={userRole}
              />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-slate-500">Товары не найдены</p>
            </div>
          )}
        </div>
        
        <ProductModal 
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddToCart={handleAddToCartFromModal}
          userRole={userRole}
        />
      </div>
    </div>
  );
};

export default HomePage;