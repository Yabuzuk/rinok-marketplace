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
          <div>
            <h2 style={{ color: '#2e7d32', marginBottom: '24px' }}>Пользовательское соглашение</h2>
            
            <section style={{ marginBottom: '32px' }}>
              <h3>1. Общие положения</h3>
              <p>1.1. Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между ООО «Азия-Сибирь» (далее — «Администрация») и пользователями маркетплейса «Rinok» (далее — «Платформа»).</p>
              <p>1.2. Использование Платформы означает полное согласие с условиями настоящего Соглашения.</p>
              <p>1.3. Администрация вправе изменять условия Соглашения в одностороннем порядке с уведомлением пользователей.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3>2. Регистрация и учетные записи</h3>
              <p>2.1. Для использования функций Платформы необходима регистрация.</p>
              <p>2.2. Пользователь обязуется предоставлять достоверную информацию при регистрации.</p>
              <p>2.3. Пользователь несет ответственность за сохранность данных своей учетной записи.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3>3. Права и обязанности пользователей</h3>
              <p>3.1. Пользователи имеют право:</p>
              <ul>
                <li>Размещать товары для продажи (продавцы)</li>
                <li>Приобретать товары (покупатели)</li>
                <li>Получать поддержку от Администрации</li>
              </ul>
              <p>3.2. Пользователи обязуются:</p>
              <ul>
                <li>Соблюдать законодательство РФ</li>
                <li>Не нарушать права третьих лиц</li>
                <li>Предоставлять качественные товары и услуги</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3>4. Заключительные положения</h3>
              <p>4.1. Соглашение действует с момента начала использования Платформы.</p>
              <p>4.2. Споры разрешаются в соответствии с законодательством РФ.</p>
            </section>
          </div>
        );

      case 'privacy':
        return (
          <div>
            <h2 style={{ color: '#2e7d32', marginBottom: '24px' }}>Политика конфиденциальности</h2>
            
            <section style={{ marginBottom: '32px' }}>
              <h3>1. Сбор персональных данных</h3>
              <p>1.1. Мы собираем следующие персональные данные:</p>
              <ul>
                <li>ФИО, адрес электронной почты, номер телефона</li>
                <li>Адрес доставки</li>
                <li>Информация о заказах и платежах</li>
                <li>Техническая информация об устройстве</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3>2. Цели обработки данных</h3>
              <p>2.1. Персональные данные обрабатываются для:</p>
              <ul>
                <li>Предоставления услуг маркетплейса</li>
                <li>Обработки заказов и платежей</li>
                <li>Связи с пользователями</li>
                <li>Улучшения качества сервиса</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3>3. Защита данных</h3>
              <p>3.1. Мы применяем технические и организационные меры для защиты персональных данных.</p>
              <p>3.2. Доступ к данным имеют только уполномоченные сотрудники.</p>
              <p>3.3. Данные не передаются третьим лицам без согласия пользователя.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3>4. Права субъектов данных</h3>
              <p>4.1. Вы имеете право:</p>
              <ul>
                <li>Получать информацию об обработке ваших данных</li>
                <li>Требовать исправления неточных данных</li>
                <li>Требовать удаления данных</li>
                <li>Отозвать согласие на обработку</li>
              </ul>
            </section>
          </div>
        );

      case 'offer':
        return (
          <div>
            <h2 style={{ color: '#2e7d32', marginBottom: '24px' }}>Публичная оферта</h2>
            
            <section style={{ marginBottom: '32px' }}>
              <h3>1. Предмет договора</h3>
              <p>1.1. ООО «Азия-Сибирь» предоставляет пользователям возможность использования маркетплейса «Rinok» для торговли товарами.</p>
              <p>1.2. Услуги предоставляются на возмездной основе согласно тарифам.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3>2. Стоимость услуг</h3>
              <p>2.1. Комиссия за продажу товаров составляет 5% от стоимости заказа.</p>
              <p>2.2. Размещение товаров на платформе — бесплатно.</p>
              <p>2.3. Дополнительные услуги продвижения оплачиваются отдельно.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3>3. Порядок расчетов</h3>
              <p>3.1. Расчеты производятся в рублях РФ.</p>
              <p>3.2. Комиссия удерживается автоматически при поступлении средств.</p>
              <p>3.3. Выплаты продавцам производятся еженедельно.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3>4. Гарантии и ответственность</h3>
              <p>4.1. Администрация гарантирует работоспособность платформы 99,5% времени.</p>
              <p>4.2. Администрация не несет ответственности за качество товаров продавцов.</p>
              <p>4.3. Споры между покупателями и продавцами разрешаются при участии Администрации.</p>
            </section>
          </div>
        );

      case 'responsibility':
        return (
          <div>
            <h2 style={{ color: '#2e7d32', marginBottom: '24px' }}>Ответственность сторон</h2>
            
            <section style={{ marginBottom: '32px' }}>
              <h3>1. Ответственность Администрации</h3>
              <p>1.1. Администрация несет ответственность за:</p>
              <ul>
                <li>Обеспечение работоспособности платформы</li>
                <li>Защиту персональных данных пользователей</li>
                <li>Соблюдение условий настоящего соглашения</li>
              </ul>
              <p>1.2. Администрация не несет ответственности за:</p>
              <ul>
                <li>Качество товаров, размещенных продавцами</li>
                <li>Действия пользователей на платформе</li>
                <li>Технические сбои, не зависящие от Администрации</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3>2. Ответственность продавцов</h3>
              <p>2.1. Продавцы несут ответственность за:</p>
              <ul>
                <li>Качество и безопасность реализуемых товаров</li>
                <li>Соответствие товаров заявленным характеристикам</li>
                <li>Соблюдение сроков доставки</li>
                <li>Предоставление достоверной информации о товарах</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3>3. Ответственность покупателей</h3>
              <p>3.1. Покупатели несут ответственность за:</p>
              <ul>
                <li>Своевременную оплату заказов</li>
                <li>Предоставление корректных данных для доставки</li>
                <li>Соблюдение правил использования платформы</li>
              </ul>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3>4. Разрешение споров</h3>
              <p>4.1. Споры разрешаются путем переговоров.</p>
              <p>4.2. При невозможности достижения соглашения споры передаются в суд по месту нахождения Администрации.</p>
              <p>4.3. Администрация оказывает содействие в разрешении споров между пользователями.</p>
            </section>

            <section style={{ marginBottom: '32px' }}>
              <h3>5. Форс-мажор</h3>
              <p>5.1. Стороны освобождаются от ответственности при наступлении обстоятельств непреодолимой силы.</p>
              <p>5.2. К форс-мажорным обстоятельствам относятся: стихийные бедствия, военные действия, изменения законодательства.</p>
            </section>
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