import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userType: 'customer' | 'seller' | 'admin' | 'courier' | 'manager', userData: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [userType, setUserType] = useState<'customer' | 'seller' | 'admin' | 'courier' | 'manager'>('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    confirmPassword: '',
    inn: '',
    pavilionNumber: '',
    vehicle: 'car'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    // Проверка для администратора
    if (userType === 'admin') {
      if (formData.email !== 'admin' || formData.password !== 'admin') {
        alert('Неверный логин или пароль администратора');
        return;
      }
      
      const adminData = {
        id: 'admin',
        name: 'Администратор',
        email: 'admin@rinok.com',
        phone: '+7 (999) 000-00-00',
        role: 'admin',
        type: 'admin',
        isAdmin: true
      };
      
      onLogin('admin', adminData);
      onClose();
      return;
    }

    // Проверка для менеджера (только при входе)
    if (userType === 'manager' && mode === 'login') {
      // Используем обычную логику входа по email
      onLogin('manager', { email: formData.email, password: formData.password, isLogin: true });
      onClose();
      return;
    }

    if (mode === 'login') {
      // При входе только проверяем существующего пользователя
      onLogin(userType, { email: formData.email, password: formData.password, isLogin: true });
      onClose();
      return;
    }

    // Для регистрации создаем нового пользователя
    const userData = {
      id: formData.email.replace('@', '_').replace('.', '_'),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: userType,
      type: userType,
      ...(userType === 'seller' && {
        inn: formData.inn,
        pavilionNumber: formData.pavilionNumber
      }),
      ...(userType === 'courier' && {
        vehicle: formData.vehicle,
        rating: 5.0,
        isActive: true
      })
    };

    onLogin(userType, userData);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div 
      style={{
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
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px',
          width: '100%',
          maxWidth: '320px',
          maxHeight: '85vh',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px'
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h2>

        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '16px',
          background: '#f5f5f5',
          borderRadius: '8px',
          padding: '4px'
        }}>
          <button
            onClick={() => setUserType('customer')}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: userType === 'customer' ? '#4caf50' : 'transparent',
              color: userType === 'customer' ? 'white' : '#666',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Покупатель
          </button>
          <button
            onClick={() => setUserType('seller')}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: userType === 'seller' ? '#4caf50' : 'transparent',
              color: userType === 'seller' ? 'white' : '#666',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Продавец
          </button>
          {mode === 'login' && (
            <>
              <button
                onClick={() => setUserType('admin')}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: userType === 'admin' ? '#4caf50' : 'transparent',
                  color: userType === 'admin' ? 'white' : '#666',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Админ
              </button>
              <button
                onClick={() => setUserType('manager')}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: userType === 'manager' ? '#9c27b0' : 'transparent',
                  color: userType === 'manager' ? 'white' : '#666',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Менеджер
              </button>
            </>
          )}


        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  <User size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Имя
                </label>
                <input
                  name="name"
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              

            </>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <Mail size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              {userType === 'admin' ? 'Логин' : 'Email'}
            </label>
            <input
              name="email"
              type={userType === 'admin' ? 'text' : 'email'}
              className="input"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={userType === 'admin' ? 'admin' : 'example@email.com'}
              required
            />
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                <Phone size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Телефон
              </label>
              <input
                name="phone"
                type="tel"
                className="input"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+7 (999) 123-45-67"
                required
              />
            </div>
          )}

          {mode === 'register' && userType === 'seller' && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  ИНН
                </label>
                <input
                  name="inn"
                  type="text"
                  className="input"
                  value={formData.inn}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                  maxLength={12}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Номер павильона
                </label>
                <input
                  name="pavilionNumber"
                  type="text"
                  className="input"
                  value={formData.pavilionNumber}
                  onChange={handleInputChange}
                  placeholder="A-15"
                  required
                />
              </div>
              

            </>
          )}



          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <Lock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Пароль
            </label>
            <input
              name="password"
              type="password"
              className="input"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <Lock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Подтвердите пароль
              </label>
              <input
                name="confirmPassword"
                type="password"
                className="input"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {mode === 'register' && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#f9f9f9', borderRadius: '8px' }}>
              {userType === 'customer' ? (
                <>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Для совершения покупок на оптбазар.рф необходимо принять следующие условия:</h4>
                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                      <input type="checkbox" required />
                      Я принимаю условия <a href="/legal" target="_blank" style={{ color: '#4caf50' }}>Пользовательского соглашения</a>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                      <input type="checkbox" required />
                      Я даю согласие на обработку персональных данных согласно <a href="/legal" target="_blank" style={{ color: '#4caf50' }}>Политике конфиденциальности</a>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                      <input type="checkbox" required />
                      Подтверждаю, что мне исполнилось 18 лет
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                      <input type="checkbox" required />
                      Понимаю, что расчеты за товары осуществляются напрямую с продавцом
                    </label>
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                    <strong>Важно:</strong><br/>
                    • Платформа не несет ответственности за качество товаров<br/>
                    • Все претензии по качеству направляются продавцу<br/>
                    • Все предложения представленные на сайте не являются публичной офертой. Цены могут меняться в течение дня и отличаться от опубликованных на сайте
                  </div>
                </>
              ) : (
                <>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Для работы на платформе необходимо принять условия сотрудничества:</h4>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ fontSize: '13px' }}>Основные условия:</strong>
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                        <input type="checkbox" required />
                        Принимаю <a href="/legal" target="_blank" style={{ color: '#4caf50' }}>Пользовательское соглашение</a>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                        <input type="checkbox" required />
                        Соглашаюсь с <a href="/legal" target="_blank" style={{ color: '#4caf50' }}>Политикой конфиденциальности</a>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                        <input type="checkbox" required />
                        Подтверждаю совершеннолетие (18+)
                      </label>
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong style={{ fontSize: '13px' }}>Условия для продавцов:</strong>
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                        <input type="checkbox" required />
                        Принимаю <a href="/legal" target="_blank" style={{ color: '#4caf50' }}>Договор-оферту на оказание услуг продвижения</a>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '4px' }}>
                        <input type="checkbox" required />
                        Обязуюсь соблюдать <a href="/legal" target="_blank" style={{ color: '#4caf50' }}>Правила размещения товаров</a>
                      </label>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                    <strong>Финансовые условия:</strong><br/>
                    • Еженедельная оплата комиссии на основе отчетности платформы<br/>
                    • Расчеты с покупателями - напрямую, без участия платформы
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '12px' }}
          >
            {mode === 'login' ? 'Войти' : (userType === 'seller' ? 'Зарегистрироваться как продавец' : 'Зарегистрироваться')}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#4caf50',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;