import React from 'react';
import { 
  Home, Search, ShoppingCart, User, Package, 
  BarChart3, Clipboard, Warehouse, Truck, 
  Map, Clock, Users, Settings, Shield, Store, Menu
} from 'lucide-react';
import { User as UserType } from '../types';

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
  onLogout
}) => {
  const [showPavilions, setShowPavilions] = React.useState(false);
  const [showBurgerMenu, setShowBurgerMenu] = React.useState(false);
  if (!user) {
    // Гостевое меню
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #d4c4b0',
        padding: '4px 0',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        <NavButton icon={<Home size={20} />} label="Главная" onClick={onHomeClick} />
        <NavButton icon={<Search size={20} />} label="Поиск" onClick={onSearchClick} />
        <NavButton 
          icon={<ShoppingCart size={20} />} 
          label="Корзина" 
          badge={cartItemsCount}
          onClick={onCartClick} 
        />
        <NavButton icon={<User size={20} />} label="Войти" onClick={onAuthClick} />
      </div>
    );
  }

  const getMenuItems = () => {
    switch (user.role) {
      case 'customer':
        return [
          { icon: <Store size={20} />, label: 'Павильоны', onClick: () => setShowPavilions(true), badge: undefined },
          { icon: <ShoppingCart size={20} />, label: 'Корзина', onClick: onCartClick, badge: cartItemsCount },
          { icon: <Home size={28} />, label: 'Главная', onClick: onHomeClick, isMain: true, badge: undefined },
          { icon: <Clipboard size={20} />, label: 'Заказы', onClick: onOrdersClick || (() => {}), badge: undefined },
          { icon: <Menu size={20} />, label: 'Меню', onClick: () => setShowBurgerMenu(true), badge: undefined }
        ];
      
      case 'seller':
        return [
          { icon: <BarChart3 size={20} />, label: 'Статистика', onClick: () => onDashboardClick('analytics'), badge: undefined },
          { icon: <Package size={20} />, label: 'Товары', onClick: () => onDashboardClick('products'), badge: undefined },
          { icon: <Clipboard size={20} />, label: 'Заказы', onClick: () => onDashboardClick('orders'), badge: undefined },
          { icon: <Warehouse size={20} />, label: 'Склад', onClick: onWarehouseClick || (() => {}), badge: undefined },
          { icon: <User size={20} />, label: 'Профиль', onClick: () => onDashboardClick('profile'), badge: undefined }
        ];
      
      case 'courier':
        return [
          { icon: <Clipboard size={20} />, label: 'Задачи', onClick: () => onDashboardClick('tasks'), badge: undefined },
          { icon: <Map size={20} />, label: 'Маршрут', onClick: () => onDashboardClick('route'), badge: undefined },
          { icon: <Truck size={20} />, label: 'Доставки', onClick: () => onDashboardClick('deliveries'), badge: undefined },
          { icon: <Clock size={20} />, label: 'График', onClick: () => onDashboardClick('schedule'), badge: undefined },
          { icon: <User size={20} />, label: 'Профиль', onClick: () => onDashboardClick('profile'), badge: undefined }
        ];
      
      case 'admin':
        return [
          { icon: <BarChart3 size={20} />, label: 'Дашборд', onClick: () => onDashboardClick('dashboard'), badge: undefined },
          { icon: <Users size={20} />, label: 'Пользователи', onClick: () => onDashboardClick('users'), badge: undefined },
          { icon: <Clipboard size={20} />, label: 'Заказы', onClick: () => onDashboardClick('orders'), badge: undefined },
          { icon: <Settings size={20} />, label: 'Настройки', onClick: () => onDashboardClick('settings'), badge: undefined },
          { icon: <Shield size={20} />, label: 'Админ', onClick: () => onDashboardClick('admin'), badge: undefined }
        ];
      
      case 'manager':
        return [
          { icon: <Clipboard size={20} />, label: 'Новые', onClick: () => onDashboardClick('orders'), badge: undefined },
          { icon: <Clock size={20} />, label: 'В работе', onClick: () => onDashboardClick?.('in-progress'), badge: undefined },
          { icon: <Package size={20} />, label: 'Архив', onClick: () => onDashboardClick?.('archive'), badge: undefined },
          { icon: <User size={20} />, label: 'Профиль', onClick: () => onDashboardClick('profile'), badge: undefined }
        ];
      
      default:
        return [];
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #d4c4b0',
      padding: '4px 0',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center'
    }}>
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
      
      {/* Модальное окно павильонов */}
      {showPavilions && (
        <div style={{
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
        }} onClick={() => setShowPavilions(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '300px',
            maxHeight: '400px',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Выберите павильон</h3>
            {pavilions.map(pavilion => (
              <button
                key={pavilion}
                onClick={() => {
                  onPavilionSelect?.(pavilion);
                  setShowPavilions(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  margin: '4px 0',
                  border: '1px solid #c8e6c9',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                🏢 Павильон {pavilion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Бургер меню */}
      {showBurgerMenu && (
        <div style={{
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
        }} onClick={() => setShowBurgerMenu(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '250px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>Меню</h3>
            {user.role !== 'manager' && (
              <>
                <button
                  onClick={() => {
                    onDashboardClick();
                    setShowBurgerMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    margin: '4px 0',
                    border: '1px solid #c8e6c9',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  👤 Профиль
                </button>
                <button
                  onClick={() => {
                    alert('Раздел "О нас" в разработке');
                    setShowBurgerMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    margin: '4px 0',
                    border: '1px solid #c8e6c9',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  ℹ️ О нас
                </button>
              </>
            )}
            {user.role === 'manager' && (
              <>
                <button
                  onClick={() => {
                    onDashboardClick();
                    setShowBurgerMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    margin: '4px 0',
                    border: '1px solid #c8e6c9',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  👤 Личный кабинет
                </button>
                <button
                  onClick={() => {
                    onLogout?.();
                    setShowBurgerMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    margin: '4px 0',
                    border: '1px solid #f44336',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#f44336'
                  }}
                >
                  🚪 Выйти
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
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
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: isMain ? '8px 12px' : '4px 8px',
      borderRadius: '8px',
      position: 'relative',
      minWidth: isMain ? '80px' : '60px',
      transform: isMain ? 'scale(1.1)' : 'scale(1)'
    }}
  >
    <div style={{ position: 'relative' }}>
      {icon}
      {badge && badge > 0 && (
        <span style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          background: '#ff6b35',
          color: 'white',
          borderRadius: '50%',
          width: '16px',
          height: '16px',
          fontSize: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '600'
        }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </div>
    <span style={{ fontSize: '10px', color: '#666' }}>{label}</span>
  </button>
);

export default BottomNavigation;