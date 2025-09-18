import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userType: 'customer' | 'seller' | 'admin' | 'courier', userData: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [userType, setUserType] = useState<'customer' | 'seller' | 'admin' | 'courier'>('customer');
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
          background: '#f9f5f0',
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
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
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

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '12px' }}
          >
            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
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