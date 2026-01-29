import React, { useState } from 'react';
import { ArrowLeft, User, Package, ShoppingCart, CheckCircle, AlertCircle, Eye, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SellerGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    { id: 1, title: 'Регистрация', icon: User },
    { id: 2, title: 'Добавление товаров', icon: Package },
    { id: 3, title: 'Обработка заказов', icon: ShoppingCart }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Руководство для продавцов
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeStep === step.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border'
                }`}
              >
                <Icon className="w-4 h-4" />
                {step.title}
              </button>
            );
          })}
        </div>

        {/* Step 1: Registration */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-orange-500" />
                Шаг 1: Регистрация продавца
              </h2>
              
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">1. Нажмите кнопку "Войти"</h3>
                  <div className="bg-white rounded-lg p-3 border-2 border-dashed border-orange-300">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Правый верхний угол</span>
                      <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-medium">
                        Войти
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">2. Выберите "Продавец"</h3>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300">
                    <div className="grid grid-cols-2 gap-3">
                      <button className="p-3 border rounded-lg text-gray-600">Покупатель</button>
                      <button className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium">
                        Продавец
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">3. Заполните форму регистрации</h3>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-green-300 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                      <input type="text" placeholder="Ваше имя" className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input type="email" placeholder="your@email.com" className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Номер павильона</label>
                      <input type="text" placeholder="например: 15A" className="w-full p-2 border rounded-lg" />
                    </div>
                    <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-medium">
                      Зарегистрироваться
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Важно!</h4>
                      <p className="text-yellow-700 text-sm">
                        Номер павильона должен быть уникальным. Если павильон уже занят, система предложит выбрать другой.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Adding Products */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-6 h-6 text-orange-500" />
                Шаг 2: Добавление товаров
              </h2>
              
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">1. Перейдите в личный кабинет</h3>
                  <div className="bg-white rounded-lg p-3 border-2 border-dashed border-orange-300">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">После входа нажмите</span>
                      <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-medium">
                        Личный кабинет
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">2. Откройте вкладку "Товары"</h3>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300">
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium">
                        Товары
                      </button>
                      <button className="px-4 py-2 border rounded-lg text-gray-600">Заказы</button>
                      <button className="px-4 py-2 border rounded-lg text-gray-600">Настройки</button>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">3. Нажмите "Добавить товар"</h3>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-green-300">
                    <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Добавить товар
                    </button>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">4. Заполните информацию о товаре</h3>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-purple-300 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Название товара</label>
                        <input type="text" placeholder="Яблоки красные" className="w-full p-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                        <select className="w-full p-2 border rounded-lg">
                          <option>Фрукты</option>
                          <option>Овощи</option>
                          <option>Молочные продукты</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Цена за кг</label>
                        <input type="number" placeholder="150" className="w-full p-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Мин. заказ</label>
                        <input type="number" placeholder="5" className="w-full p-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">В наличии</label>
                        <input type="number" placeholder="100" className="w-full p-2 border rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                      <textarea placeholder="Свежие красные яблоки..." className="w-full p-2 border rounded-lg h-20"></textarea>
                    </div>
                    <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-medium">
                      Сохранить товар
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">5. Управление товарами</h3>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">🍎</div>
                          <div>
                            <h4 className="font-medium">Яблоки красные</h4>
                            <p className="text-sm text-gray-600">150₽/кг • В наличии: 100кг</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Order Processing */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-orange-500" />
                Шаг 3: Обработка заказов
              </h2>
              
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">1. Получение уведомлений</h3>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-orange-300">
                    <div className="flex items-center gap-3 p-3 bg-orange-100 rounded-lg">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">!</div>
                      <div>
                        <h4 className="font-medium text-orange-800">Новый заказ!</h4>
                        <p className="text-sm text-orange-700">Поступил заказ на сумму 750₽</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">2. Просмотр заказов</h3>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300">
                    <div className="flex gap-2 mb-3">
                      <button className="px-4 py-2 border rounded-lg text-gray-600">Товары</button>
                      <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium">
                        Заказы
                      </button>
                      <button className="px-4 py-2 border rounded-lg text-gray-600">Настройки</button>
                    </div>
                    <div className="space-y-2">
                      <div className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Заказ #1234</h4>
                            <p className="text-sm text-gray-600">Яблоки 10кг, Груши 5кг</p>
                            <p className="text-sm text-yellow-700 font-medium">Ожидает подтверждения</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">750₽</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Новый
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">3. Обработка заказа</h3>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-green-300">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Заказ #1234</h4>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Новый</span>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span>Яблоки красные</span>
                          <span>10кг × 150₽ = 1500₽</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Груши</span>
                          <span>5кг × 120₽ = 600₽</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Итого:</span>
                          <span>2100₽</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-medium">
                          Подтвердить
                        </button>
                        <button className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium">
                          Отклонить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">4. Статусы заказов</h3>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-purple-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">Ожидает подтверждения</span>
                        </div>
                        <p className="text-sm text-gray-600">Новый заказ, требует вашего решения</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-medium">Подтвержден</span>
                        </div>
                        <p className="text-sm text-gray-600">Заказ принят, готовится к отправке</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Ожидает оплаты</span>
                        </div>
                        <p className="text-sm text-gray-600">Покупатель должен оплатить заказ</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">Готов к доставке</span>
                        </div>
                        <p className="text-sm text-gray-600">Заказ готов, ожидает курьера</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">5. Изменение статуса</h3>
                  <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Заказ #1234</h4>
                        <select className="px-3 py-1 border rounded-lg">
                          <option>Подтвержден</option>
                          <option>Ожидает оплаты</option>
                          <option>Готов к доставке</option>
                          <option>Отменен</option>
                        </select>
                      </div>
                      <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-lg font-medium">
                        Обновить статус
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4">💡 Полезные советы</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Быстрая обработка</h4>
              <p className="text-sm opacity-90">Обрабатывайте заказы в течение 30 минут для лучшего рейтинга</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Актуальные остатки</h4>
              <p className="text-sm opacity-90">Регулярно обновляйте количество товаров в наличии</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Качественные фото</h4>
              <p className="text-sm opacity-90">Добавляйте четкие фотографии товаров для увеличения продаж</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Связь с покупателями</h4>
              <p className="text-sm opacity-90">Отвечайте на вопросы покупателей быстро и вежливо</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerGuidePage;