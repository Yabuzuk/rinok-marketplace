import React, { useState } from 'react';
import { ShoppingCart, User, Search, MapPin, ChevronDown } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  user: UserType | null;
  cartItemsCount: number;
  onAuthClick: () => void;
  onCartClick: () => void;
  onLogin: (userType: 'customer' | 'seller') => void;
}

const Header: React.FC<HeaderProps> = ({ user, cartItemsCount, onAuthClick, onCartClick, onLogin }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <header style={{ 
      background: '#fefcf8', 
      borderBottom: '1px solid #e2e8f0',
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
            background: 'linear-gradient(135deg, #4fd1c7 0%, #38b2ac 100%)',
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
          margin: '0 16px',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <ShoppingCart size={24} color="#666" />
            {cartItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '0',
                right: '0',
                background: '#4fd1c7',
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

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => user ? onAuthClick() : setShowDropdown(!showDropdown)}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#faf6f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <User size={20} color="#666" />
              <span style={{ color: '#666', fontSize: '12px', display: window.innerWidth > 768 ? 'block' : 'none' }}>
                {user ? user.name : 'Войти'}
              </span>
              {!user && <ChevronDown size={16} color="#666" />}
            </button>
            
            {showDropdown && !user && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: '#fefcf8',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                minWidth: '150px'
              }}>
                <button
                  onClick={() => { onLogin('customer'); setShowDropdown(false); }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px',
                    borderBottom: '1px solid #e2e8f0'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#faf6f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  Войти как покупатель
                </button>
                <button
                  onClick={() => { onLogin('seller'); setShowDropdown(false); }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#faf6f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  Войти как продавец
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;