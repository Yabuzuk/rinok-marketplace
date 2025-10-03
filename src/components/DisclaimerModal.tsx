import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const DisclaimerModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('hasSeenDisclaimer');
    if (!hasSeenDisclaimer) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenDisclaimer', 'true');
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        margin: '20px',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
      }}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} color="#666" />
        </button>
        
        <h3 style={{
          margin: '0 0 16px 0',
          color: '#333',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          Уведомление
        </h3>
        
        <p style={{
          margin: 0,
          color: '#666',
          lineHeight: '1.5',
          fontSize: '14px'
        }}>
          Все предложения представленные на сайте не являются публичной офертой. 
          Цены могут меняться в течение дня и отличаться от опубликованных на сайте.
        </p>
      </div>
    </div>
  );
};

export default DisclaimerModal;