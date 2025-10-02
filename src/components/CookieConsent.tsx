import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 1000,
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Cookie size={24} style={{ color: '#4caf50', marginTop: '4px' }} />
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>
            Использование файлов cookie
          </h4>
          <p style={{ 
            margin: '0 0 16px 0', 
            fontSize: '14px', 
            lineHeight: 1.5, 
            color: '#666' 
          }}>
            Мы используем файлы cookie для улучшения работы сайта и персонализации контента. 
            Продолжая использовать сайт, вы соглашаетесь с нашей{' '}
            <button
              onClick={() => navigate('/legal')}
              style={{
                background: 'none',
                border: 'none',
                color: '#4caf50',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: 0,
                font: 'inherit'
              }}
            >
              политикой конфиденциальности
            </button>.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleAccept}
              style={{
                background: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Принять все
            </button>
            <button
              onClick={handleDecline}
              style={{
                background: 'transparent',
                color: '#666',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Только необходимые
            </button>
          </div>
        </div>
        <button
          onClick={handleDecline}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;