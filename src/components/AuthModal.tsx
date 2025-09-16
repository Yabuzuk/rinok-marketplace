import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userType: 'customer' | 'seller' | 'admin', userData: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [userType, setUserType] = useState<'customer' | 'seller' | 'admin'>('customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    confirmPassword: '',
    inn: '',
    pavilionNumber: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
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
        id: '3',
        name: 'Администратор',
        email: 'admin@rinok.com',
        phone: '+7 (999) 000-00-00',
        type: 'admin'
      };
      
      onLogin('admin', adminData);
      onClose();
      return;
    }

    const userData = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      type: userType,
      ...(userType === 'seller' && {
        inn: formData.inn,
        pavilionNumber: formData.pavilionNumber
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
      zIndex: 1000
    }}>
      <div style={{
        background: '#f9f5f0',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '400px',
        margin: '16px',
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
            padding: '8px'
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h2>

        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
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
              background: userType === 'customer' ? '#8b4513' : 'transparent',
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
              background: userType === 'seller' ? '#8b4513' : 'transparent',
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
              background: userType === 'admin' ? '#8b4513' : 'transparent',
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
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <User size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
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
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
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
            <div style={{ marginBottom: '24px' }}>
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
            style={{ width: '100%', marginBottom: '16px' }}
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
              color: '#8b4513',
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