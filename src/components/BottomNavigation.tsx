import React from 'react';
import { 
  Home, Search, ShoppingCart, User, Package, 
  BarChart3, Clipboard, Warehouse, Truck, 
  Map, Clock, Users, Settings, Shield
} from 'lucide-react';
import { User as UserType } from '../types';

interface BottomNavigationProps {
  user: UserType | null;
  cartItemsCount: number;
  onHomeClick: () => void;
  onSearchClick: () => void;
  onCartClick: () => void;
  onDashboardClick: () => void;
  onOrdersClick?: () => void;
  onWarehouseClick?: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  user,
  cartItemsCount,
  onHomeClick,
  onSearchClick,
  onCartClick,
  onDashboardClick,
  onOrdersClick,
  onWarehouseClick
}) => {
  if (!user) {
    // Гостевое меню
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#f9f5f0',
        borderTop: '1px solid #d4c4b0',
        padding: '8px 0',
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
        <NavButton icon={<User size={20} />} label="Войти" onClick={onDashboardClick} />
      </div>
    );
  }

  const getMenuItems = () => {
    switch (user.role) {
      case 'customer':
        return [
          { icon: <Search size={20} />, label: 'Поиск', onClick: onSearchClick },
          { icon: <Clipboard size={20} />, label: 'Заказы', onClick: onOrdersClick },
          { icon: <Home size={28} />, label: 'Главная', onClick: onHomeClick, isMain: true },
          { icon: <ShoppingCart size={20} />, label: 'Корзина', onClick: onCartClick, badge: cartItemsCount },
          { icon: <User size={20} />, label: 'Профиль', onClick: onDashboardClick }
        ];
      
      case 'seller':
        return [
          { icon: <BarChart3 size={20} />, label: 'Статистика', onClick: onDashboardClick },
          { icon: <Package size={20} />, label: 'Товары', onClick: onDashboardClick },
          { icon: <Clipboard size={20} />, label: 'Заказы', onClick: onDashboardClick },
          { icon: <Warehouse size={20} />, label: 'Склад', onClick: onWarehouseClick },
          { icon: <User size={20} />, label: 'Профиль', onClick: onDashboardClick }
        ];
      
      case 'courier':
        return [
          { icon: <Clipboard size={20} />, label: 'Задачи', onClick: onDashboardClick },
          { icon: <Map size={20} />, label: 'Маршрут', onClick: onDashboardClick },
          { icon: <Truck size={20} />, label: 'Доставки', onClick: onDashboardClick },
          { icon: <Clock size={20} />, label: 'График', onClick: onDashboardClick },
          { icon: <User size={20} />, label: 'Профиль', onClick: onDashboardClick }
        ];
      
      case 'admin':
        return [
          { icon: <BarChart3 size={20} />, label: 'Дашборд', onClick: onDashboardClick },
          { icon: <Users size={20} />, label: 'Пользователи', onClick: onDashboardClick },
          { icon: <Clipboard size={20} />, label: 'Заказы', onClick: onDashboardClick },
          { icon: <Settings size={20} />, label: 'Настройки', onClick: onDashboardClick },
          { icon: <Shield size={20} />, label: 'Админ', onClick: onDashboardClick }
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
      background: '#f9f5f0',
      borderTop: '1px solid #d4c4b0',
      padding: '8px 0',
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
          badge={item.badge}
          onClick={item.onClick}
          isMain={item.isMain}
        />
      ))}
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
      padding: isMain ? '12px' : '8px',
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