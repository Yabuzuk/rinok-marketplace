import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Shield, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer style={{
      background: 'white',
      borderTop: '1px solid #e0e0e0',
      marginTop: '40px',
      padding: '32px 0'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '32px',
          marginBottom: '32px'
        }}>
          {/* Company Info */}
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              <span style={{ color: '#f44336' }}>Азия</span>
              <span style={{ color: '#4caf50' }}>-Сибирь</span>
            </div>
            <p style={{ color: '#666', marginBottom: '16px', lineHeight: 1.5 }}>
              Современный маркетплейс для торговли свежими продуктами от местных производителей
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                <Phone size={16} />
                <span>+7 (383) 123-45-67</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                <Mail size={16} />
                <span>info@asia-sibir.ru</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                <MapPin size={16} />
                <span>г. Новосибирск</span>
              </div>
            </div>
          </div>

          {/* Legal Documents */}
          <div>
            <h4 style={{ marginBottom: '16px', color: '#2e7d32' }}>Правовая информация</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/legal')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  padding: '4px 0',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#4caf50'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
              >
                <FileText size={16} />
                Пользовательское соглашение
              </button>
              <button
                onClick={() => navigate('/legal')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  padding: '4px 0',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#4caf50'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
              >
                <Shield size={16} />
                Политика конфиденциальности
              </button>
              <button
                onClick={() => navigate('/legal')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  padding: '4px 0',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#4caf50'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
              >
                <FileText size={16} />
                Публичная оферта
              </button>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ marginBottom: '16px', color: '#2e7d32' }}>Поддержка</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#666' }}>
              <div>Время работы: 9:00 - 21:00</div>
              <div>Email: support@asia-sibir.ru</div>
              <div>Telegram: @asia_sibir_support</div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid #e0e0e0',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ color: '#666', fontSize: '14px' }}>
            © 2024 ООО «Азия-Сибирь». Все права защищены.
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
            <span style={{ color: '#666' }}>ИНН: 1234567890</span>
            <span style={{ color: '#666' }}>ОГРН: 1234567890123</span>
          </div>
        </div>
      </div>

      <style>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        
        h4 {
          font-size: 16px;
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          footer {
            padding: 24px 0;
          }
          
          .container > div:first-child {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          .container > div:last-child {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;