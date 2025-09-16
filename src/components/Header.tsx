import React from 'react';
import { ShoppingCart, User, Search, MapPin } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  user: UserType | null;
  cartItemsCount: number;
  onAuthClick: () => void;
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, cartItemsCount, onAuthClick, onCartClick }) => {
  return (
    <header style={{ 
      background: 'white', 
      borderBottom: '1px solid #f0f0f0',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        height: '72px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Rinok
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
            <MapPin size={16} />
            <span style={{ fontSize: '14px' }}>Москва</span>
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          maxWidth: '400px', 
          margin: '0 32px',
          position: 'relative'
        }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '16px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#999'
            }} 
          />
          <input 
            className="input"
            placeholder="Найти товары"
            style={{ paddingLeft: '48px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onCartClick}
            style={{ 
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <ShoppingCart size={24} color="#666" />
            {cartItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '0',
                right: '0',
                background: '#ff6b35',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600'
              }}>
                {cartItemsCount}
              </span>
            )}
          </button>

          <button 
            onClick={onAuthClick}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <User size={24} color="#666" />
            <span style={{ color: '#666', fontSize: '14px' }}>
              {user ? user.name : 'Войти'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;