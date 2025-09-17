import React, { useState } from 'react';
import { Truck, Clock, CheckCircle, DollarSign, User, Settings } from 'lucide-react';
import DeliveryCard from '../components/DeliveryCard';
import { Delivery, User as UserType } from '../types';

interface CourierDashboardProps {
  deliveries: Delivery[];
  courier: UserType;
  onAcceptDelivery?: (deliveryId: string) => void;
  onUpdateDeliveryStatus?: (deliveryId: string, status: Delivery['status']) => void;
  onUpdateProfile?: (updates: Partial<UserType>) => void;
}

const CourierDashboard: React.FC<CourierDashboardProps> = ({
  deliveries,
  courier,
  onAcceptDelivery,
  onUpdateDeliveryStatus,
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed' | 'profile'>('available');
  const [isEditing, setIsEditing] = useState(false);

  const availableDeliveries = deliveries.filter(d => d.status === 'pending');
  const activeDeliveries = deliveries.filter(d => 
    d.courierId === courier.id && ['assigned', 'picked_up', 'in_transit'].includes(d.status)
  );
  const completedDeliveries = deliveries.filter(d => 
    d.courierId === courier.id && d.status === 'delivered'
  );

  const todayEarnings = completedDeliveries
    .filter(d => new Date(d.actualTime || '').toDateString() === new Date().toDateString())
    .reduce((sum, d) => sum + d.deliveryFee, 0);

  const totalEarnings = completedDeliveries.reduce((sum, d) => sum + d.deliveryFee, 0);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      vehicle: formData.get('vehicle') as UserType['vehicle']
    };
    onUpdateProfile?.(updates);
    setIsEditing(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `url('/images/green-grass-summer-gazon-fon-trava-zelenaia.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      paddingTop: '100px',
      paddingBottom: '40px'
    }}>
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700',
            marginBottom: '8px',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
          }}>
            Личный кабинет курьера
          </h1>
          <p style={{ 
            color: 'white', 
            fontSize: '16px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}>
            Добро пожаловать, {courier.name}!
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-4" style={{ marginBottom: '32px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <Truck size={32} color="#4caf50" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
              {activeDeliveries.length}
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Активные доставки</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <CheckCircle size={32} color="#4caf50" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
              {completedDeliveries.length}
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Выполнено доставок</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <DollarSign size={32} color="#4caf50" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
              {todayEarnings} ₽
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Заработано сегодня</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center' }}>
            <Clock size={32} color="#4caf50" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#4caf50', marginBottom: '4px' }}>
              {totalEarnings} ₽
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>Общий заработок</p>
          </div>
        </div>

        {/* Вкладки */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('available')}
              className={activeTab === 'available' ? 'btn btn-primary' : 'btn btn-secondary'}
            >
              Доступные ({availableDeliveries.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={activeTab === 'active' ? 'btn btn-primary' : 'btn btn-secondary'}
            >
              Мои доставки ({activeDeliveries.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={activeTab === 'completed' ? 'btn btn-primary' : 'btn btn-secondary'}
            >
              Выполненные ({completedDeliveries.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={activeTab === 'profile' ? 'btn btn-primary' : 'btn btn-secondary'}
            >
              Профиль
            </button>
          </div>
        </div>

        {/* Доступные доставки */}
        {activeTab === 'available' && (
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}>
              Доступные заказы
            </h2>
            {availableDeliveries.length > 0 ? (
              availableDeliveries.map(delivery => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onAccept={onAcceptDelivery}
                />
              ))
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                <Truck size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#666' }} />
                <p style={{ color: '#666' }}>Нет доступных заказов</p>
              </div>
            )}
          </div>
        )}

        {/* Активные доставки */}
        {activeTab === 'active' && (
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}>
              Мои доставки
            </h2>
            {activeDeliveries.length > 0 ? (
              activeDeliveries.map(delivery => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onUpdateStatus={onUpdateDeliveryStatus}
                />
              ))
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#666' }} />
                <p style={{ color: '#666' }}>Нет активных доставок</p>
              </div>
            )}
          </div>
        )}

        {/* Выполненные доставки */}
        {activeTab === 'completed' && (
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}>
              История доставок
            </h2>
            {completedDeliveries.length > 0 ? (
              completedDeliveries.map(delivery => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  showActions={false}
                />
              ))
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                <Clock size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#666' }} />
                <p style={{ color: '#666' }}>Нет выполненных доставок</p>
              </div>
            )}
          </div>
        )}

        {/* Профиль */}
        {activeTab === 'profile' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Мой профиль</h2>
              <button 
                className="btn btn-secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Settings size={16} />
                {isEditing ? 'Отмена' : 'Редактировать'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-2" style={{ marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Имя
                    </label>
                    <input name="name" className="input" defaultValue={courier.name} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Телефон
                    </label>
                    <input name="phone" className="input" defaultValue={courier.phone} required />
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Транспорт
                  </label>
                  <select name="vehicle" className="input" defaultValue={courier.vehicle} required>
                    <option value="foot">Пешком</option>
                    <option value="bike">Велосипед</option>
                    <option value="car">Автомобиль</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">
                  Сохранить изменения
                </button>
              </form>
            ) : (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '32px',
                    fontWeight: '600',
                    margin: '0 auto 16px'
                  }}>
                    {courier.name?.charAt(0)?.toUpperCase() || 'C'}
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong>Имя:</strong> {courier.name}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong>Email:</strong> {courier.email}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong>Телефон:</strong> {courier.phone || 'Не указан'}
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong>Транспорт:</strong> {
                    courier.vehicle === 'car' ? 'Автомобиль' :
                    courier.vehicle === 'bike' ? 'Велосипед' :
                    courier.vehicle === 'foot' ? 'Пешком' : 'Не указан'
                  }
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <strong>Рейтинг:</strong> 
                  <span style={{ 
                    color: '#4caf50',
                    fontWeight: '600',
                    marginLeft: '8px'
                  }}>
                    {courier.rating ? `${courier.rating.toFixed(1)} ⭐` : 'Нет оценок'}
                  </span>
                </div>
                
                <div>
                  <strong>Статус:</strong> 
                  <span style={{ 
                    color: courier.isActive ? '#4caf50' : '#f44336',
                    fontWeight: '600',
                    marginLeft: '8px'
                  }}>
                    {courier.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourierDashboard;