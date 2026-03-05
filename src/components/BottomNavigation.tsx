import React from 'react';
import { 
  Home, Search, ShoppingCart, User, Package, 
  BarChart3, FileText, Warehouse, Truck, 
  MapPin, Timer, Users, Settings, Shield, Building2, MoreHorizontal,
  TrendingUp, Box, CheckSquare, UserCircle, Menu
} from 'lucide-react';
import { User as UserType } from '../types';
import { useNavigate } from 'react-router-dom';

interface BottomNavigationProps {
  user: UserType | null;
  cartItemsCount: number;
  onHomeClick: () => void;
  onSearchClick: () => void;
  onCartClick: () => void;
  onDashboardClick: (tab?: string) => void;
  onOrdersClick?: () => void;
  onWarehouseClick?: () => void;
  onPavilionSelect?: (pavilionNumber: string) => void;
  pavilions?: string[];
  onAuthClick: () => void;
  onLogout?: () => void;
  products?: any[];
  onProductSelect?: (product: any) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  user,
  cartItemsCount,
  onHomeClick,
  onSearchClick,
  onCartClick,
  onDashboardClick,
  onOrdersClick,
  onWarehouseClick,
  onPavilionSelect,
  pavilions = [],
  onAuthClick,
  onLogout,
  products = [],
  onProductSelect
}) => {
  const navigate = useNavigate();
  const [showPavilions, setShowPavilions] = React.useState(false);
  const [showBurgerMenu, setShowBurgerMenu] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [newOrdersCount, setNewOrdersCount] = React.useState(0);
  
  // Отслеживаем счетчик новых заказов для продавца
  React.useEffect(() => {
    if (user?.role === 'seller' && user.pavilionNumber) {
      const updateCount = () => {
        const count = (window as any).sellerNewOrdersCount || 0;
        console.log('🔄 BottomNav reading counter:', count);
        setNewOrdersCount(count);
      };
      
      updateCount();
      const interval = setInterval(updateCount, 1000);
      
      return () => clearInterval(interval);
    }
  }, [user]);
  const [activeTab, setActiveTab] = React.useState('home');

  const renderNavigation = () => {
    if (!user) {
      return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
          <div className="flex justify-around items-center py-3">
            <NavButton 
              emoji="🏠" 
              onClick={() => { setActiveTab('home'); onHomeClick(); }}
              isActive={activeTab === 'home'}
            />
            <NavButton 
              emoji="🔍" 
              onClick={() => { setActiveTab('search'); setShowSearch(true); }}
              isActive={activeTab === 'search'}
            />
            <NavButton 
              emoji="🛒" 
              badge={cartItemsCount}
              onClick={() => { setActiveTab('cart'); onCartClick(); }}
              isActive={activeTab === 'cart'}
            />
            <NavButton 
              emoji="☰" 
              onClick={() => { setActiveTab('menu'); setShowBurgerMenu(true); }}
              isActive={activeTab === 'menu'}
            />
          </div>
        </div>
      );
    }

    const menuItems = getMenuItems();
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
        <div className="flex justify-around items-center py-3">
          {menuItems.map((item, index) => (
            <NavButton
              key={index}
              emoji={'emoji' in item ? item.emoji : undefined}
              badge={'badge' in item ? item.badge : undefined}
              onClick={() => { setActiveTab(index.toString()); item.onClick(); }}
              isActive={activeTab === index.toString()}
            />
          ))}
        </div>
      </div>
    );
  };

  const getMenuItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'customer':
        return [
          { emoji: '👥', label: 'Совместные', onClick: () => onDashboardClick('group-orders'), badge: undefined },
          { emoji: '🛒', label: 'Корзина', onClick: onCartClick, badge: cartItemsCount },
          { emoji: '🏠', label: 'Главная', onClick: onHomeClick, isMain: true, badge: undefined },
          { emoji: '📋', label: 'Заказы', onClick: onOrdersClick || (() => {}), badge: undefined },
          { emoji: '☰', label: 'Меню', onClick: () => setShowBurgerMenu(true), badge: undefined }
        ];
      
      case 'seller':
        return [
          { emoji: '📊', label: 'Статистика', onClick: () => onDashboardClick('analytics'), badge: undefined },
          { emoji: '📦', label: 'Товары', onClick: () => onDashboardClick('products'), badge: undefined },
          { emoji: '📋', label: 'Заказы', onClick: () => onDashboardClick('orders'), badge: newOrdersCount > 0 ? newOrdersCount : undefined },
          { emoji: '🏪', label: 'Склад', onClick: onWarehouseClick || (() => {}), badge: undefined },
          { emoji: '👤', label: 'Профиль', onClick: () => onDashboardClick('profile'), badge: undefined }
        ];
      
      case 'courier':
        return [
          { emoji: '✅', label: 'Задачи', onClick: () => onDashboardClick('tasks'), badge: undefined },
          { emoji: '📍', label: 'Маршрут', onClick: () => onDashboardClick('route'), badge: undefined },
          { emoji: '🚚', label: 'Доставки', onClick: () => onDashboardClick('deliveries'), badge: undefined },
          { emoji: '⏰', label: 'График', onClick: () => onDashboardClick('schedule'), badge: undefined },
          { emoji: '👤', label: 'Профиль', onClick: () => onDashboardClick('profile'), badge: undefined }
        ];
      
      case 'admin':
        return [
          { emoji: '📦', label: 'Товары', onClick: () => onDashboardClick('products'), badge: undefined },
          { emoji: '👥', label: 'Пользователи', onClick: () => onDashboardClick('users'), badge: undefined },
          { emoji: '📋', label: 'Заказы', onClick: () => onDashboardClick('orders'), badge: undefined },
          { emoji: '📊', label: 'Статистика', onClick: () => onDashboardClick('dashboard'), badge: undefined },
          { emoji: '☰', label: 'Меню', onClick: () => setShowBurgerMenu(true), badge: undefined }
        ];
      
      case 'manager':
        return [
          { emoji: '📋', label: 'Новые', onClick: () => onDashboardClick('orders'), badge: undefined },
          { emoji: '👥', label: 'Пулы', onClick: () => onDashboardClick('pools'), badge: undefined },
          { emoji: '⏰', label: 'В работе', onClick: () => onDashboardClick?.('in-progress'), badge: undefined },
          { emoji: '📦', label: 'Архив', onClick: () => onDashboardClick?.('archive'), badge: undefined },
          { emoji: '👤', label: 'Профиль', onClick: () => onDashboardClick('profile'), badge: undefined }
        ];
      
      default:
        return [];
    }
  };

  return (
    <>
      {renderNavigation()}
      
      {/* Модальное окно поиска */}
      {showSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20" onClick={() => setShowSearch(false)}>
          <div className="bg-white rounded-xl border border-slate-200 p-4 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Поиск товаров</h3>
              <button 
                onClick={() => setShowSearch(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input 
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Найти товары"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 2) {
                    const filtered = products.filter(product => 
                      product.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
                      product.description?.toLowerCase().includes(e.target.value.toLowerCase())
                    ).slice(0, 8);
                    setSearchResults(filtered);
                  } else {
                    setSearchResults([]);
                  }
                }}
                autoFocus
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 cursor-pointer hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 last:border-b-0 rounded-lg"
                    onClick={() => {
                      onProductSelect?.(product);
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowSearch(false);
                    }}
                  >
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.price} ₽</div>
                      <div className="text-xs text-slate-400">Павильон {product.pavilionNumber}</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onProductSelect?.(product);
                      }}
                      className="px-2 py-1 bg-violet-600 text-white rounded text-xs hover:bg-violet-700"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <div className="text-2xl mb-2">🔍</div>
                <p>Товары не найдены</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Модальное окно павильонов */}
      {showPavilions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowPavilions(false)}>
          <div className="bg-white rounded-xl p-6 w-80 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-center text-lg font-semibold text-slate-900">Выберите павильон</h3>
            {pavilions.map(pavilion => (
              <button
                key={pavilion}
                onClick={() => {
                  onPavilionSelect?.(pavilion);
                  setShowPavilions(false);
                }}
                className="w-full p-3 my-1 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 cursor-pointer text-left transition-colors"
              >
                🏢 Павильон {pavilion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Бургер меню */}
      {showBurgerMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowBurgerMenu(false)}>
          <div className="bg-white rounded-xl p-6 w-72 max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-center text-lg font-semibold text-slate-900">Меню</h3>
            
            {/* Профиль для авторизованных */}
            {user && (
              <button
                onClick={() => {
                  onDashboardClick();
                  setShowBurgerMenu(false);
                }}
                className="w-full p-3 my-1 border border-green-200 rounded-lg bg-white hover:bg-green-50 cursor-pointer text-left transition-colors"
              >
                👤 {user.role === 'manager' ? 'Личный кабинет' : 'Профиль'}
              </button>
            )}
            
            {/* Вход для гостей */}
            {!user && (
              <button
                onClick={() => {
                  onAuthClick();
                  setShowBurgerMenu(false);
                }}
                className="w-full p-3 my-1 border border-green-500 rounded-lg bg-green-500 text-white hover:bg-green-600 cursor-pointer text-left font-semibold transition-colors"
              >
                🔑 Войти / Регистрация
              </button>
            )}
            
            {/* Разделитель */}
            <div className="h-px bg-slate-200 my-4" />
            
            {/* Юридическая информация */}
            <div className="mb-3">
              <h4 className="text-sm text-slate-600 mb-2">Правовая информация</h4>
              <button
                onClick={() => {
                  navigate('/legal?tab=terms');
                  setShowBurgerMenu(false);
                }}
                className="w-full px-3 py-2 my-0.5 border-none rounded-md bg-slate-100 hover:bg-slate-200 cursor-pointer text-left text-xs transition-colors"
              >
                📄 Пользовательское соглашение
              </button>
              <button
                onClick={() => {
                  navigate('/legal?tab=privacy');
                  setShowBurgerMenu(false);
                }}
                className="w-full px-3 py-2 my-0.5 border-none rounded-md bg-slate-100 hover:bg-slate-200 cursor-pointer text-left text-xs transition-colors"
              >
                🔒 Политика конфиденциальности
              </button>
              <button
                onClick={() => {
                  navigate('/legal?tab=offer');
                  setShowBurgerMenu(false);
                }}
                className="w-full px-3 py-2 my-0.5 border-none rounded-md bg-slate-100 hover:bg-slate-200 cursor-pointer text-left text-xs transition-colors"
              >
                📋 Публичная оферта
              </button>
              <button
                onClick={() => {
                  navigate('/legal?tab=responsibility');
                  setShowBurgerMenu(false);
                }}
                className="w-full px-3 py-2 my-0.5 border-none rounded-md bg-slate-100 hover:bg-slate-200 cursor-pointer text-left text-xs transition-colors"
              >
                ⚖️ Ответственность сторон
              </button>
            </div>
            
            {/* Контакты */}
            <div className="mb-3">
              <h4 className="text-sm text-slate-600 mb-2">Контакты</h4>
              <div className="text-xs text-slate-600 leading-relaxed">
                <div>📧 vietnam.amix@gmail.com</div>
                <div className="flex items-center gap-1">
                  📞 +7 913 949 2570
                  <img src="/Логотип_MAX.svg" alt="MAX" className="w-4 h-4 ml-1" />
                </div>
                <div>📍 г. Новосибирск</div>
              </div>
            </div>
            
            {/* Выход для авторизованных */}
            {user && (
              <>
                <div className="h-px bg-slate-200 my-4" />
                <button
                  onClick={() => {
                    onLogout?.();
                    setShowBurgerMenu(false);
                  }}
                  className="w-full p-3 my-1 border border-red-500 rounded-lg bg-white hover:bg-red-50 cursor-pointer text-left text-red-500 transition-colors"
                >
                  🚪 Выйти
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const NavButton: React.FC<{
  emoji?: string;
  icon?: React.ReactNode;
  badge?: number;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ emoji, icon, badge, onClick, isActive }) => (
  <button
    onClick={onClick}
    className="relative flex items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-200"
    style={{
      WebkitTapHighlightColor: 'transparent',
      width: '56px',
      height: '56px'
    }}
  >
    <div 
      className="absolute inset-0 rounded-2xl transition-all duration-300"
      style={{
        backgroundColor: isActive ? '#f3f3f3' : 'transparent',
        transform: isActive ? 'scale(1)' : 'scale(0.8)',
        opacity: isActive ? 1 : 0
      }}
    />
    <div className="relative z-10">
      {emoji ? (
        <div 
          className="text-3xl transition-all duration-200"
          style={{
            filter: isActive ? 'grayscale(0) brightness(1)' : 'grayscale(1) brightness(0.8) opacity(0.6)'
          }}
        >
          {emoji}
        </div>
      ) : (
        <div style={{ color: isActive ? '#000' : '#999' }}>
          {icon}
        </div>
      )}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] px-1.5 text-[10px] flex items-center justify-center font-bold">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </div>
  </button>
);

export default BottomNavigation;