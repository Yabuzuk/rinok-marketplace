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
  const renderNavigation = () => {
    if (!user) {
      // Гостевое меню
      return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-1 z-50 flex justify-around items-center">
          <NavButton icon={<Home size={20} />} label="Главная" onClick={onHomeClick} />
          <NavButton icon={<Search size={20} />} label="Поиск" onClick={() => setShowSearch(true)} />
          <NavButton 
            icon={<ShoppingCart size={20} />} 
            label="Корзина" 
            badge={cartItemsCount}
            onClick={onCartClick} 
          />
          <NavButton icon={<Menu size={20} />} label="Меню" onClick={() => setShowBurgerMenu(true)} />
        </div>
      );
    }

    // Меню для авторизованных пользователей
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-1 z-50 flex justify-around items-center">
        {getMenuItems().map((item, index) => (
          <NavButton
            key={index}
            icon={item.icon}
            label={item.label}
            badge={'badge' in item ? item.badge : undefined}
            onClick={item.onClick}
            isMain={'isMain' in item ? item.isMain : undefined}
          />
        ))}
      </div>
    );
  };

  const getMenuItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'customer':
        return [
          { icon: <Building2 size={20} />, label: 'Павильоны', onClick: () => setShowPavilions(true), badge: undefined },
          { icon: <ShoppingCart size={20} />, label: 'Корзина', onClick: onCartClick, badge: cartItemsCount },
          { icon: <Home size={28} />, label: 'Главная', onClick: onHomeClick, isMain: true, badge: undefined },
          { icon: <FileText size={20} />, label: 'Заказы', onClick: onOrdersClick || (() => {}), badge: undefined },
          { icon: <Menu size={20} />, label: 'Меню', onClick: () => setShowBurgerMenu(true), badge: undefined }
        ];
      
      case 'seller':
        return [
          { icon: <TrendingUp size={20} />, label: 'Статистика', onClick: () => onDashboardClick('analytics'), badge: undefined },
          { icon: <Box size={20} />, label: 'Товары', onClick: () => onDashboardClick('products'), badge: undefined },
          { icon: <FileText size={20} />, label: 'Заказы', onClick: () => onDashboardClick('orders'), badge: newOrdersCount > 0 ? newOrdersCount : undefined },
          { icon: <Warehouse size={20} />, label: 'Склад', onClick: onWarehouseClick || (() => {}), badge: undefined },
          { icon: <UserCircle size={20} />, label: 'Профиль', onClick: () => onDashboardClick('profile'), badge: undefined }
        ];
      
      case 'courier':
        return [
          { icon: <CheckSquare size={20} />, label: 'Задачи', onClick: () => onDashboardClick('tasks'), badge: undefined },
          { icon: <MapPin size={20} />, label: 'Маршрут', onClick: () => onDashboardClick('route'), badge: undefined },
          { icon: <Truck size={20} />, label: 'Доставки', onClick: () => onDashboardClick('deliveries'), badge: undefined },
          { icon: <Timer size={20} />, label: 'График', onClick: () => onDashboardClick('schedule'), badge: undefined },
          { icon: <UserCircle size={20} />, label: 'Профиль', onClick: () => onDashboardClick('profile'), badge: undefined }
        ];
      
      case 'admin':
        return [
          { icon: <Box size={20} />, label: 'Товары', onClick: () => onDashboardClick('products'), badge: undefined },
          { icon: <Users size={20} />, label: 'Пользователи', onClick: () => onDashboardClick('users'), badge: undefined },
          { icon: <FileText size={20} />, label: 'Заказы', onClick: () => onDashboardClick('orders'), badge: undefined },
          { icon: <TrendingUp size={20} />, label: 'Статистика', onClick: () => onDashboardClick('dashboard'), badge: undefined },
          { icon: <Menu size={20} />, label: 'Меню', onClick: () => setShowBurgerMenu(true), badge: undefined }
        ];
      
      case 'manager':
        return [
          { icon: <FileText size={20} />, label: 'Новые', onClick: () => onDashboardClick('orders'), badge: undefined },
          { icon: <Users size={20} />, label: 'Пулы', onClick: () => onDashboardClick('pools'), badge: undefined },
          { icon: <Timer size={20} />, label: 'В работе', onClick: () => onDashboardClick?.('in-progress'), badge: undefined },
          { icon: <Package size={20} />, label: 'Архив', onClick: () => onDashboardClick?.('archive'), badge: undefined },
          { icon: <UserCircle size={20} />, label: 'Профиль', onClick: () => onDashboardClick('profile'), badge: undefined }
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
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
  isMain?: boolean;
}> = ({ icon, label, badge, onClick, isMain }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer rounded-lg relative ${
      isMain ? 'px-3 py-2 min-w-20 scale-110' : 'px-2 py-1 min-w-15'
    }`}
  >
    <div className="relative">
      {icon}
      {badge !== undefined && (
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center font-semibold">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
    <span className="text-xs text-slate-600">{label}</span>
  </button>
);

export default BottomNavigation;