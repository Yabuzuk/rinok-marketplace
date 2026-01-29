import React, { useState } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { Order, OrderItem } from '../types';

interface EditOrderModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (orderId: string, updates: Partial<Order>) => Promise<void>;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ order, isOpen, onClose, onUpdate }) => {
  console.log('EditOrderModal rendered with:', { order, isOpen });
  console.log('Order items:', order.items);
  console.log('Order status:', order.status);
  
  const [items, setItems] = useState<OrderItem[]>((order.items || []).filter(item => item.productId !== 'delivery'));
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) {
    console.log('Modal not open, returning null');
    return null;
  }

  if (!order.items || order.items.length === 0) {
    console.log('No items in order');
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div className="card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
          <h3>Ошибка</h3>
          <p>В заказе нет товаров для редактирования</p>
          <button onClick={onClose} className="btn btn-secondary">Закрыть</button>
        </div>
      </div>
    );
  }

  const originalTotal = (order.items || []).filter(item => item.productId !== 'delivery').reduce((sum, item) => sum + item.price * item.quantity, 0);
  const newTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleUpdateItem = (index: number, field: 'quantity' | 'price', value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!reason.trim()) {
      alert('Укажите причину изменения заказа');
      return;
    }

    setLoading(true);
    try {
      const updates: Partial<Order> = {
        items: [...items, ...(order.items || []).filter(item => item.productId === 'delivery')],
        total: newTotal + (order.deliveryPrice || 0),
        isModified: true,
        modificationReason: reason,
        originalTotal: originalTotal,
        customerApproved: false,
        modifiedAt: new Date().toISOString(),
        status: 'customer_approval'
      };

      await onUpdate(order.id, updates);
      onClose();
    } catch (error) {
      alert('Ошибка сохранения изменений');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600' }}>
            Редактирование заказа #{order.id.slice(-6)}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '12px' }}>Товары в заказе:</h4>
          {items.map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              marginBottom: '8px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500' }}>{item.productName}</div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handleUpdateItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                  style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleUpdateItem(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '60px', textAlign: 'center', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <button
                  onClick={() => handleUpdateItem(index, 'quantity', item.quantity + 1)}
                  style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <input
                type="number"
                value={item.price}
                onChange={(e) => handleUpdateItem(index, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                style={{ width: '80px', textAlign: 'center', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <span>₽</span>

              <button
                onClick={() => handleRemoveItem(index)}
                style={{ padding: '4px', border: 'none', background: 'transparent', color: '#f44336', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Причина изменения заказа:
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Укажите причину изменения (например: товар закончился, изменилась цена)"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              minHeight: '60px',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div>
            <div>Было: {originalTotal} ₽</div>
            <div style={{ fontWeight: '600', color: newTotal !== originalTotal ? '#f44336' : '#4caf50' }}>
              Стало: {newTotal} ₽
            </div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>
            Изменение: {newTotal - originalTotal > 0 ? '+' : ''}{newTotal - originalTotal} ₽
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={loading || items.length === 0 || !reason.trim()}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOrderModal;