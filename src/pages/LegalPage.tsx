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
            <iframe 
              src="/legal/terms-of-service.md"
              style={{
                width: '100%',
                height: '600px',
                border: 'none',
                background: 'white'
              }}
              title="Пользовательское соглашение"
            />
          </div>
        );

      case 'privacy':
        return (
          <div>
            <iframe 
              src="/legal/privacy-policy.md"
              style={{
                width: '100%',
                height: '600px',
                border: 'none',
                background: 'white'
              }}
              title="Политика конфиденциальности"
            />
          </div>
        );

      case 'offer':
        return (
          <div>
            <iframe 
              src="/legal/public-offer.md"
              style={{
                width: '100%',
                height: '600px',
                border: 'none',
                background: 'white'
              }}
              title="Публичная оферта"
            />
          </div>
        );

      case 'responsibility':
        return (
          <div>
            <iframe 
              src="/legal/liability-agreement.md"
              style={{
                width: '100%',
                height: '600px',
                border: 'none',
                background: 'white'
              }}
              title="Соглашение об ответственности сторон"
            />
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