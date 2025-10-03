import React, { useState } from 'react';
import { ArrowLeft, FileText, Shield, Users, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LegalPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('terms');

  const tabs = [
    { id: 'terms', name: 'Пользовательское соглашение', icon: FileText },
    { id: 'privacy', name: 'Политика конфиденциальности', icon: Shield },
    { id: 'offer', name: 'Публичная оферта', icon: Users },
    { id: 'responsibility', name: 'Ответственность сторон', icon: AlertTriangle }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'terms':
        return (
          <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '20px' }}>
            <h2 style={{ color: '#2e7d32', marginBottom: '24px' }}>Пользовательское соглашение маркетплейса "Rinok"</h2>
            <p><strong>Дата вступления в силу: 01.01.2024</strong></p>
            
            <h3>1. ОБЩИЕ ПОЛОЖЕНИЯ</h3>
            <p>1.1. Настоящее Пользовательское соглашение является публичной офертой и регулирует отношения между ООО «Азия-Сибирь» и пользователями интернет-платформы «Rinok».</p>
            <p>1.2. Использование Платформы означает полное принятие условий настоящего Соглашения.</p>
            <p>1.3. Администрация вправе изменять условия Соглашения с уведомлением пользователей.</p>
            
            <h3>2. ТЕРМИНЫ И ОПРЕДЕЛЕНИЯ</h3>
            <p>2.1. <strong>Маркетплейс</strong> — интернет-платформа для торговли товарами.</p>
            <p>2.2. <strong>Продавец</strong> — лицо, размещающее товары для продажи.</p>
            <p>2.3. <strong>Покупатель</strong> — лицо, приобретающее товары.</p>
            
            <h3>3. ПРЕДМЕТ СОГЛАШЕНИЯ</h3>
            <p>3.1. Администрация предоставляет доступ к функционалу Платформы для торговли.</p>
            <p>3.2. Отношения купли-продажи возникают между Продавцом и Покупателем.</p>
            
            <h3>4. РЕГИСТРАЦИЯ</h3>
            <p>4.1. Для использования функций требуется регистрация.</p>
            <p>4.2. Пользователь обязуется предоставлять достоверную информацию.</p>
            
            <h3>5. ПРАВА И ОБЯЗАННОСТИ</h3>
            <p>5.1. Пользователи имеют право использовать Платформу по назначению.</p>
            <p>5.2. Пользователи обязуются соблюдать законодательство РФ.</p>
            
            <h3>6. ОТВЕТСТВЕННОСТЬ</h3>
            <p>6.1. Администрация не несет ответственности за качество товаров продавцов.</p>
            <p>6.2. Максимальная ответственность ограничена суммой комиссии.</p>
            
            <h3>7. РАЗРЕШЕНИЕ СПОРОВ</h3>
            <p>7.1. Споры разрешаются путем переговоров.</p>
            <p>7.2. При невозможности соглашения — в суде по месту нахождения Администрации.</p>
            
            <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
              <h4>Контактная информация:</h4>
              <p>Email: legal@asia-sibir.ru</p>
              <p>Телефон: +7 (383) 123-45-67</p>
              <p>Адрес: 630000, г. Новосибирск, ул. Примерная, д. 1</p>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '20px' }}>
            <h2 style={{ color: '#2e7d32', marginBottom: '24px' }}>Политика конфиденциальности маркетплейса "Rinok"</h2>
            <p><strong>Дата вступления в силу: 01.01.2024</strong></p>
            
            <h3>1. ОБЩИЕ ПОЛОЖЕНИЯ</h3>
            <p>1.1. Политика определяет порядок обработки персональных данных в соответствии с 152-ФЗ.</p>
            <p>1.2. Использование Платформы означает согласие с условиями Политики.</p>
            
            <h3>2. ПЕРСОНАЛЬНЫЕ ДАННЫЕ</h3>
            <p>2.1. Мы собираем следующие категории данных:</p>
            <ul>
              <li>Идентификационные данные: ФИО, дата рождения</li>
              <li>Контактные данные: телефон, email, адрес</li>
              <li>Коммерческие данные: заказы, платежи</li>
              <li>Технические данные: IP-адрес, браузер</li>
            </ul>
            
            <h3>3. ЦЕЛИ ОБРАБОТКИ</h3>
            <p>3.1. Данные обрабатываются для:</p>
            <ul>
              <li>Предоставления услуг маркетплейса</li>
              <li>Обработки заказов и платежей</li>
              <li>Связи с пользователями</li>
              <li>Обеспечения безопасности</li>
            </ul>
            
            <h3>4. ПРАВОВЫЕ ОСНОВАНИЯ</h3>
            <p>4.1. Обработка осуществляется на основании согласия и исполнения договора.</p>
            
            <h3>5. МЕРЫ ЗАЩИТЫ</h3>
            <p>5.1. Применяются технические и организационные меры защиты.</p>
            <p>5.2. Доступ имеют только уполномоченные сотрудники.</p>
            
            <h3>6. ПРАВА СУБЪЕКТОВ</h3>
            <p>6.1. Вы имеете право на получение информации об обработке данных.</p>
            <p>6.2. Право на исправление, удаление и отзыв согласия.</p>
            
            <h3>7. COOKIE</h3>
            <p>7.1. Используются для функционирования сайта и аналитики.</p>
            
            <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
              <h4>Контактная информация:</h4>
              <p>Email: privacy@asia-sibir.ru</p>
              <p>Телефон: +7 (383) 123-45-67</p>
              <p>Ответственный за обработку ПДн: Иванов И.И.</p>
            </div>
          </div>
        );

      case 'offer':
        return (
          <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '20px' }}>
            <h2 style={{ color: '#2e7d32', marginBottom: '24px' }}>Публичная оферта маркетплейса "Rinok"</h2>
            <p><strong>Дата вступления в силу: 01.01.2024</strong></p>
            
            <h3>1. ПРЕДМЕТ ДОГОВОРА</h3>
            <p>1.1. ООО «Азия-Сибирь» предоставляет доступ к маркетплейсу «Rinok».</p>
            <p>1.2. Услуги предоставляются на возмездной основе.</p>
            
            <h3>2. СТОИМОСТЬ УСЛУГ</h3>
            <p>2.1. Комиссия за продажу: 5% от стоимости заказа.</p>
            <p>2.2. Размещение товаров: бесплатно.</p>
            <p>2.3. Дополнительные услуги: согласно тарифам.</p>
            
            <h3>3. ПОРЯДОК РАСЧЕТОВ</h3>
            <p>3.1. Расчеты в рублях РФ.</p>
            <p>3.2. Комиссия удерживается автоматически.</p>
            <p>3.3. Выплаты продавцам еженедельно.</p>
            
            <h3>4. СПОСОБЫ ОПЛАТЫ</h3>
            <ul>
              <li>Банковские карты (Visa, MasterCard, МИР)</li>
              <li>Электронные кошельки</li>
              <li>Банковский перевод</li>
              <li>Наличные при получении</li>
            </ul>
            
            <h3>5. ПРАВА И ОБЯЗАННОСТИ</h3>
            <p>5.1. Исполнитель обеспечивает работоспособность 99,5% времени.</p>
            <p>5.2. Заказчик обязуется своевременно оплачивать услуги.</p>
            
            <h3>6. ОТВЕТСТВЕННОСТЬ</h3>
            <p>6.1. Штрафы за нарушения согласно тарифам.</p>
            <p>6.2. Исполнитель не отвечает за качество товаров продавцов.</p>
            
            <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
              <h4>Реквизиты:</h4>
              <p>ООО «Азия-Сибирь»</p>
              <p>ИНН: 1234567890</p>
              <p>Email: info@asia-sibir.ru</p>
            </div>
          </div>
        );

      case 'responsibility':
        return (
          <div style={{ maxHeight: '600px', overflowY: 'auto', padding: '20px' }}>
            <h2 style={{ color: '#2e7d32', marginBottom: '24px' }}>Соглашение об ответственности сторон</h2>
            <p><strong>Дата вступления в силу: 01.01.2024</strong></p>
            
            <h3>1. ОТВЕТСТВЕННОСТЬ АДМИНИСТРАЦИИ</h3>
            <p>1.1. Администрация несет ответственность за:</p>
            <ul>
              <li>Обеспечение работоспособности платформы</li>
              <li>Защиту персональных данных</li>
              <li>Соблюдение условий соглашения</li>
            </ul>
            <p>1.2. Не несет ответственности за:</p>
            <ul>
              <li>Качество товаров продавцов</li>
              <li>Действия пользователей</li>
              <li>Технические сбои третьих лиц</li>
            </ul>
            
            <h3>2. ОТВЕТСТВЕННОСТЬ ПРОДАВЦОВ</h3>
            <p>2.1. Продавцы отвечают за:</p>
            <ul>
              <li>Качество и безопасность товаров</li>
              <li>Соблюдение сроков доставки</li>
              <li>Достоверность информации</li>
            </ul>
            
            <h3>3. ШТРАФНЫЕ САНКЦИИ</h3>
            <p>3.1. За нарушение сроков:</p>
            <ul>
              <li>Несвоевременное подтверждение: 500₽</li>
              <li>Отмена заказа: 1000₽</li>
              <li>Нарушение доставки: 10% от заказа</li>
            </ul>
            
            <h3>4. ОТВЕТСТВЕННОСТЬ ПОКУПАТЕЛЕЙ</h3>
            <p>4.1. Покупатели обязаны:</p>
            <ul>
              <li>Своевременно оплачивать заказы</li>
              <li>Предоставлять корректные данные</li>
              <li>Соблюдать правила платформы</li>
            </ul>
            
            <h3>5. РАЗРЕШЕНИЕ СПОРОВ</h3>
            <p>5.1. Обязательный претензионный порядок.</p>
            <p>5.2. Срок рассмотрения: 30 дней.</p>
            <p>5.3. Судебное разрешение в Новосибирске.</p>
            
            <h3>6. ФОРС-МАЖОР</h3>
            <p>6.1. Освобождение от ответственности при непреодолимой силе.</p>
            
            <div style={{ marginTop: '40px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
              <h4>Контакты юридического отдела:</h4>
              <p>Email: legal@asia-sibir.ru</p>
              <p>Телефон: +7 (383) 123-45-67 доб. 101</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f9fc', paddingTop: '24px' }}>
      <div className="container">
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              color: '#2e7d32'
            }}
          >
            <ArrowLeft size={20} />
            Назад
          </button>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e0e0e0',
            overflowX: 'auto'
          }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 20px',
                    border: 'none',
                    background: activeTab === tab.id ? '#4caf50' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#666',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content'
                  }}
                >
                  <Icon size={16} />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div style={{ padding: '32px' }}>
            {renderContent()}
          </div>
        </div>

        {/* Contact Info */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginTop: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2e7d32', marginBottom: '16px' }}>Контактная информация</h3>
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px', color: '#666' }}>
            <div><strong>ООО «Азия-Сибирь»</strong></div>
            <div>ИНН: 1234567890</div>
            <div>ОГРН: 1234567890123</div>
            <div>Адрес: г. Новосибирск, ул. Примерная, д. 1</div>
            <div>Email: legal@asia-sibir.ru</div>
            <div>Телефон: +7 (383) 123-45-67</div>
          </div>
        </div>
      </div>

      <style>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        
        h3 {
          color: #2e7d32;
          margin: 24px 0 16px 0;
          font-size: 18px;
        }
        
        p {
          margin-bottom: 12px;
          line-height: 1.6;
          color: #333;
        }
        
        ul {
          margin: 12px 0;
          padding-left: 20px;
        }
        
        li {
          margin-bottom: 8px;
          line-height: 1.5;
          color: #333;
        }
        
        section {
          border-left: 3px solid #4caf50;
          padding-left: 16px;
        }
      `}</style>
    </div>
  );
};

export default LegalPage;