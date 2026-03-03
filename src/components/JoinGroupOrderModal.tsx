import React, { useState } from 'react';
import { X, Users } from 'lucide-react';

interface JoinGroupOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
}

const JoinGroupOrderModal: React.FC<JoinGroupOrderModalProps> = ({
  isOpen,
  onClose,
  onJoin
}) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onJoin(code.trim().toUpperCase());
      setCode('');
    }
  };

  return (
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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '400px',
        width: '100%',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={24} color="#6B7280" />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} color="white" />
          </div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            Присоединиться к заказу
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Код совместного заказа
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SOSEDI-XXXX"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                textAlign: 'center',
                letterSpacing: '2px'
              }}
              maxLength={11}
            />
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            style={{
              width: '100%',
              padding: '14px',
              background: code.trim() 
                ? 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)'
                : '#E5E7EB',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: code.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s'
            }}
          >
            Присоединиться
          </button>
        </form>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#F3F4F6',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#6B7280'
        }}>
          💡 Попросите организатора поделиться кодом или QR-кодом заказа
        </div>
      </div>
    </div>
  );
};

export default JoinGroupOrderModal;
