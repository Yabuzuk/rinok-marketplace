import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userType: 'customer' | 'seller' | 'admin' | 'courier' | 'manager', userData: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const navigate = useNavigate();
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-4 w-full max-w-sm max-h-[85vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-transparent border-none cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center text-slate-900">
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h2>

        <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setUserType('customer')}
            className={`flex-1 py-2 px-3 border-none rounded-md text-sm cursor-pointer transition-colors ${
              userType === 'customer' ? 'bg-green-500 text-white' : 'bg-transparent text-slate-600'
            }`}
          >
            Покупатель
          </button>
          <button
            onClick={() => setUserType('seller')}
            className={`flex-1 py-2 px-3 border-none rounded-md text-sm cursor-pointer transition-colors ${
              userType === 'seller' ? 'bg-green-500 text-white' : 'bg-transparent text-slate-600'
            }`}
          >
            Продавец
          </button>
          {mode === 'login' && (
            <>
              <button
                onClick={() => setUserType('admin')}
                className={`flex-1 py-2 px-2 border-none rounded-md text-xs cursor-pointer transition-colors ${
                  userType === 'admin' ? 'bg-green-500 text-white' : 'bg-transparent text-slate-600'
                }`}
              >
                Админ
              </button>
              <button
                onClick={() => setUserType('manager')}
                className={`flex-1 py-2 px-2 border-none rounded-md text-xs cursor-pointer transition-colors ${
                  userType === 'manager' ? 'bg-purple-600 text-white' : 'bg-transparent text-slate-600'
                }`}
              >
                Менеджер
              </button>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="mb-3">
              <label className="block mb-1.5 text-xs font-medium">
                <User size={14} className="mr-1.5 inline" />
                Имя
              </label>
              <input
                name="name"
                type="text"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">
              <Mail size={16} className="mr-2 inline" />
              {userType === 'admin' ? 'Логин' : 'Email'}
            </label>
            <input
              name="email"
              type={userType === 'admin' ? 'text' : 'email'}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={userType === 'admin' ? 'admin' : 'example@email.com'}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="mb-3">
              <label className="block mb-1 text-xs font-medium">
                <Phone size={16} className="mr-2 inline" />
                Телефон
              </label>
              <input
                name="phone"
                type="tel"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+7 (999) 123-45-67"
                required
              />
            </div>
          )}

          {mode === 'register' && userType === 'seller' && (
            <>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  ИНН
                </label>
                <input
                  name="inn"
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.inn}
                  onChange={handleInputChange}
                  placeholder="1234567890"
                  maxLength={12}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Номер павильона
                </label>
                <input
                  name="pavilionNumber"
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={formData.pavilionNumber}
                  onChange={handleInputChange}
                  placeholder="A-15"
                  required
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">
              <Lock size={16} className="mr-2 inline" />
              Пароль
            </label>
            <input
              name="password"
              type="password"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="mb-3">
              <label className="block mb-2 text-sm font-medium">
                <Lock size={16} className="mr-2 inline" />
                Подтвердите пароль
              </label>
              <input
                name="confirmPassword"
                type="password"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {mode === 'register' && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              {userType === 'customer' ? (
                <>
                  <h4 className="text-sm font-semibold mb-3">Для совершения покупок на оптбазар.рф необходимо принять следующие условия:</h4>
                  <div className="mb-2">
                    <label className="flex items-center gap-2 text-xs mb-1">
                      <input type="checkbox" required className="w-3 h-3" />
                      Я принимаю условия <button type="button" onClick={() => navigate('/legal?tab=terms')} className="bg-transparent border-none text-green-500 underline cursor-pointer p-0 text-xs">Пользовательского соглашения</button>
                    </label>
                    <label className="flex items-center gap-2 text-xs mb-1">
                      <input type="checkbox" required className="w-3 h-3" />
                      Я даю согласие на обработку персональных данных согласно <button type="button" onClick={() => navigate('/legal?tab=privacy')} className="bg-transparent border-none text-green-500 underline cursor-pointer p-0 text-xs">Политике конфиденциальности</button>
                    </label>
                    <label className="flex items-center gap-2 text-xs mb-1">
                      <input type="checkbox" required className="w-3 h-3" />
                      Подтверждаю, что мне исполнилось 18 лет
                    </label>
                    <label className="flex items-center gap-2 text-xs mb-1">
                      <input type="checkbox" required className="w-3 h-3" />
                      Понимаю, что расчеты за товары осуществляются напрямую с продавцом
                    </label>
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
                    <strong>Важно:</strong><br/>
                    • Платформа не несет ответственности за качество товаров<br/>
                    • Все претензии по качеству направляются продавцу<br/>
                    • Все предложения представленные на сайте не являются публичной офертой. Цены могут меняться в течение дня и отличаться от опубликованных на сайте
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-semibold mb-3">Для работы на платформе необходимо принять условия сотрудничества:</h4>
                  <div className="mb-3">
                    <strong className="text-xs">Основные условия:</strong>
                    <div className="mt-2">
                      <label className="flex items-center gap-2 text-xs mb-1">
                        <input type="checkbox" required className="w-3 h-3" />
                        Принимаю <button type="button" onClick={() => navigate('/legal?tab=terms')} className="bg-transparent border-none text-green-500 underline cursor-pointer p-0 text-xs">Пользовательское соглашение</button>
                      </label>
                      <label className="flex items-center gap-2 text-xs mb-1">
                        <input type="checkbox" required className="w-3 h-3" />
                        Соглашаюсь с <button type="button" onClick={() => navigate('/legal?tab=privacy')} className="bg-transparent border-none text-green-500 underline cursor-pointer p-0 text-xs">Политикой конфиденциальности</button>
                      </label>
                      <label className="flex items-center gap-2 text-xs mb-1">
                        <input type="checkbox" required className="w-3 h-3" />
                        Подтверждаю совершеннолетие (18+)
                      </label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong className="text-xs">Условия для продавцов:</strong>
                    <div className="mt-2">
                      <label className="flex items-center gap-2 text-xs mb-1">
                        <input type="checkbox" required className="w-3 h-3" />
                        Принимаю <button type="button" onClick={() => navigate('/legal?tab=offer')} className="bg-transparent border-none text-green-500 underline cursor-pointer p-0 text-xs">Договор-оферту на оказание услуг продвижения</button>
                      </label>
                      <label className="flex items-center gap-2 text-xs mb-1">
                        <input type="checkbox" required className="w-3 h-3" />
                        Обязуюсь соблюдать <button type="button" onClick={() => navigate('/legal?tab=product-rules')} className="bg-transparent border-none text-green-500 underline cursor-pointer p-0 text-xs">Правила размещения товаров</button>
                      </label>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
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
            className="w-full py-3 mb-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            {mode === 'login' ? 'Войти' : (userType === 'seller' ? 'Зарегистрироваться как продавец' : 'Зарегистрироваться')}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="bg-transparent border-none text-green-500 text-sm cursor-pointer underline"
          >
            {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;