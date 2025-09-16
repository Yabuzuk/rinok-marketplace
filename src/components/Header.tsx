import React, { useState } from 'react';
import { ShoppingCart, User, Search, MapPin } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  user: UserType | null;
  cartItemsCount: number;
  onAuthClick: () => void;
  onCartClick: () => void;
  onLogin: (userType: 'customer' | 'seller', userData?: any) => void;
  onShowAuthModal: () => void;
  onDashboardClick: () => void;
  onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, cartItemsCount, onAuthClick, onCartClick, onLogin, onShowAuthModal, onDashboardClick, onHomeClick }) => {

  return (
    <header style={{ 
      background: '#f9f5f0', 
      borderBottom: '1px solid #d4c4b0',
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
          <div 
            onClick={onHomeClick}
            style={{ 
              fontSize: '24px', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #8b4513 0%, #6b3410 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
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
            onMouseEnter={(e) => e.currentTarget.style.background = '#f0e6d6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <ShoppingCart size={24} color="#666" />
            {cartItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '0',
                right: '0',
                background: '#8b4513',
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
            {user ? (
              <button 
                onClick={onDashboardClick}
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
                onMouseEnter={(e) => e.currentTarget.style.background = '#f0e6d6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <User size={20} color="#666" />
                <span style={{ color: '#666', fontSize: '12px', display: window.innerWidth > 768 ? 'block' : 'none' }}>
                  Личный кабинет
                </span>
              </button>
            ) : (
              <button 
                onClick={onShowAuthModal}
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
                onMouseEnter={(e) => e.currentTarget.style.background = '#f0e6d6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <User size={20} color="#666" />
                <span style={{ color: '#666', fontSize: '12px', display: window.innerWidth > 768 ? 'block' : 'none' }}>
                  Войти
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;