import React from 'react';
import { MapPin, Clock, Phone, Package } from 'lucide-react';
import { Delivery } from '../types';

interface DeliveryCardProps {
  delivery: Delivery;
  onAccept?: (deliveryId: string) => void;
  onUpdateStatus?: (deliveryId: string, status: Delivery['status']) => void;
  showActions?: boolean;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({ 
  delivery, 
  onAccept, 
  onUpdateStatus, 
  showActions = true 
}) => {
  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'assigned': return '#2196f3';
      case 'picked_up': return '#9c27b0';
      case 'in_transit': return '#ff5722';
      case 'delivered': return '#4caf50';
      default: return '#666';
    }
  };

  const getStatusText = (status: Delivery['status']) => {
    switch (status) {
      case 'pending': return 'Ожидает курьера';
      case 'assigned': return 'Назначен';
      case 'picked_up': return 'Забран';
      case 'in_transit': return 'В пути';
      case 'delivered': return 'Доставлен';
      default: return status;
    }
  };

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
            Заказ #{delivery.orderId.slice(-8)}
          </h3>
          <div style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            color: getStatusColor(delivery.status),
            background: `${getStatusColor(delivery.status)}20`,
            display: 'inline-block'
          }}>
            {getStatusText(delivery.status)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#4caf50' }}>
            {delivery.deliveryFee} ₽
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Package size={16} color="#666" />
          <span style={{ fontSize: '14px', color: '#666' }}>Забрать:</span>
        </div>
        <div style={{ fontSize: '14px', marginLeft: '24px', marginBottom: '12px' }}>
          {delivery.pickupAddress}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <MapPin size={16} color="#666" />
          <span style={{ fontSize: '14px', color: '#666' }}>Доставить:</span>
        </div>
        <div style={{ fontSize: '14px', marginLeft: '24px', marginBottom: '12px' }}>
          {delivery.deliveryAddress}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} color="#666" />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {delivery.estimatedTime}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Phone size={14} color="#666" />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {delivery.customerPhone}
            </span>
          </div>
        </div>
      </div>

      {delivery.notes && (
        <div style={{
          padding: '8px',
          background: 'rgba(76, 175, 80, 0.1)',
          borderRadius: '6px',
          fontSize: '12px',
          marginBottom: '16px'
        }}>
          <strong>Примечания:</strong> {delivery.notes}
        </div>
      )}

      {showActions && (
        <div style={{ display: 'flex', gap: '8px' }}>
          {delivery.status === 'pending' && onAccept && (
            <button 
              className="btn btn-primary"
              onClick={() => onAccept(delivery.id)}
              style={{ flex: 1, fontSize: '14px', padding: '8px' }}
            >
              Принять заказ
            </button>
          )}
          
          {delivery.status === 'assigned' && onUpdateStatus && (
            <button 
              className="btn btn-primary"
              onClick={() => onUpdateStatus(delivery.id, 'picked_up')}
              style={{ flex: 1, fontSize: '14px', padding: '8px' }}
            >
              Забрал товар
            </button>
          )}
          
          {delivery.status === 'picked_up' && onUpdateStatus && (
            <button 
              className="btn btn-primary"
              onClick={() => onUpdateStatus(delivery.id, 'in_transit')}
              style={{ flex: 1, fontSize: '14px', padding: '8px' }}
            >
              В пути
            </button>
          )}
          
          {delivery.status === 'in_transit' && onUpdateStatus && (
            <button 
              className="btn btn-primary"
              onClick={() => onUpdateStatus(delivery.id, 'delivered')}
              style={{ flex: 1, fontSize: '14px', padding: '8px' }}
            >
              Доставлено
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryCard;