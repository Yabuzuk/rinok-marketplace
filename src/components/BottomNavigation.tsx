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
  const navigate = useNavigate();
  const [showPavilions, setShowPavilions] = React.useState(false);
  const [showBurgerMenu, setShowBurgerMenu] = React.useState(false);
  const renderNavigation = () => {
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
          <NavButton icon={<Menu size={20} />} label="Меню" onClick={() => setShowBurgerMenu(true)} />
        </div>
      );
    }

    // Меню для авторизованных пользователей
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
      </div>
    );
  };

  const getMenuItems = () => {
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
          { icon: <FileText size={20} />, label: 'Заказы', onClick: () => onDashboardClick('orders'), badge: undefined },
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
          { icon: <TrendingUp size={20} />, label: 'Дашборд', onClick: () => onDashboardClick('dashboard'), badge: undefined },
          { icon: <Users size={20} />, label: 'Пользователи', onClick: () => onDashboardClick('users'), badge: undefined },
          { icon: <FileText size={20} />, label: 'Заказы', onClick: () => onDashboardClick('orders'), badge: undefined },
          { icon: <Settings size={20} />, label: 'Настройки', onClick: () => onDashboardClick('settings'), badge: undefined },
          { icon: <Shield size={20} />, label: 'Админ', onClick: () => onDashboardClick('admin'), badge: undefined }
        ];
      
      case 'manager':
        return [
          { icon: <FileText size={20} />, label: 'Новые', onClick: () => onDashboardClick('orders'), badge: undefined },
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
            width: '280px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', textAlign: 'center', color: '#2e7d32' }}>Меню</h3>
            
            {/* Профиль для авторизованных */}
            {user && (
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
                style={{
                  width: '100%',
                  padding: '12px',
                  margin: '4px 0',
                  border: '1px solid #4caf50',
                  borderRadius: '8px',
                  background: '#4caf50',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: '600'
                }}
              >
                🔑 Войти / Регистрация
              </button>
            )}
            
            {/* Разделитель */}
            <div style={{ height: '1px', background: '#e0e0e0', margin: '16px 0' }} />
            
            {/* Юридическая информация */}
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Правовая информация</h4>
              <button
                onClick={() => {
                  navigate('/legal?tab=terms');
                  setShowBurgerMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  margin: '2px 0',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px'
                }}
              >
                📄 Пользовательское соглашение
              </button>
              <button
                onClick={() => {
                  navigate('/legal?tab=privacy');
                  setShowBurgerMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  margin: '2px 0',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px'
                }}
              >
                🔒 Политика конфиденциальности
              </button>
              <button
                onClick={() => {
                  navigate('/legal?tab=offer');
                  setShowBurgerMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  margin: '2px 0',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px'
                }}
              >
                📋 Публичная оферта
              </button>
              <button
                onClick={() => {
                  navigate('/legal?tab=responsibility');
                  setShowBurgerMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  margin: '2px 0',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px'
                }}
              >
                ⚖️ Ответственность сторон
              </button>
              <button
                onClick={() => {
                  navigate('/legal?tab=product-rules');
                  setShowBurgerMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  margin: '2px 0',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px'
                }}
              >
                📦 Правила размещения товаров
              </button>
            </div>
            
            {/* Контакты */}
            <div style={{ marginBottom: '12px' }}>
              <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Контакты</h4>
              <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.4 }}>
                <div>📧 amixvn@gmail.com</div>
                <div>📞 +7 913 949 2570</div>
                <div>📍 г. Новосибирск</div>
              </div>
            </div>
            
            {/* Выход для авторизованных */}
            {user && (
              <>
                <div style={{ height: '1px', background: '#e0e0e0', margin: '16px 0' }} />
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