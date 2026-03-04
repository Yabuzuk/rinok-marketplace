import React from 'react';
import { GroupOrderParticipant } from '../types';

interface ParticipantCardProps {
  participant: GroupOrderParticipant;
  isOrganizer?: boolean;
  deliveryShare?: number;
  isCurrentUser?: boolean;
  onRemoveItem?: (itemIndex: number) => void;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({ 
  participant, 
  isOrganizer = false,
  isCurrentUser = false,
  onRemoveItem
}) => {
  return (
    <div style={{
      padding: '15px',
      background: '#f9f9f9',
      borderRadius: '8px',
      marginBottom: '10px',
      border: isOrganizer ? '2px solid #ff6b35' : '1px solid #ddd'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            {isOrganizer && '👑 '}
            {participant.userName}
            {isOrganizer && <span style={{ color: '#ff6b35', fontSize: '12px', marginLeft: '8px' }}>Организатор</span>}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Товары: {participant.productsTotal}₽
            {participant.deliveryShare > 0 && ` • Доставка: ${participant.deliveryShare}₽`}
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ marginBottom: '5px' }}>
            {participant.productsPaid ? (
              <span style={{ color: '#4caf50', fontSize: '14px' }}>✅ Товары оплачены</span>
            ) : (
              <span style={{ color: '#ff9800', fontSize: '14px' }}>⏳ Ожидает оплаты</span>
            )}
          </div>
          
          {participant.deliveryShare > 0 && (
            <div>
              {participant.deliveryPaid ? (
                <span style={{ color: '#4caf50', fontSize: '14px' }}>✅ Доставка оплачена</span>
              ) : (
                <span style={{ color: '#ff9800', fontSize: '14px' }}>⏳ Ожидает оплаты</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {participant.items.length > 0 && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Товары:</div>
          {participant.items.map((item, idx) => (
            <div key={idx} style={{ 
              fontSize: '13px', 
              color: '#333', 
              marginBottom: '3px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>• {item.productName} × {item.quantity} = {item.price * item.quantity}₽</span>
              {isCurrentUser && !participant.productsPaid && onRemoveItem && (
                <button
                  onClick={() => onRemoveItem(idx)}
                  style={{
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Удалить
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
