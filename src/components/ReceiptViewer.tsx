import React from 'react';
import { FileText, Image, Download, ExternalLink } from 'lucide-react';

interface ReceiptViewerProps {
  receiptUrl: string;
  onClose: () => void;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ receiptUrl, onClose }) => {
  const isPDF = receiptUrl.toLowerCase().includes('.pdf') || receiptUrl.includes('application/pdf');
  const fileName = receiptUrl.split('/').pop() || 'receipt';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = receiptUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Заголовок с кнопками */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isPDF ? <FileText size={20} color="#f44336" /> : <Image size={20} color="#4caf50" />}
            <span style={{ fontWeight: '600', fontSize: '16px' }}>
              {isPDF ? 'PDF чек' : 'Чек об оплате'}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDownload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <Download size={14} />
              Скачать
            </button>
            
            <button
              onClick={() => window.open(receiptUrl, '_blank')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                background: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <ExternalLink size={14} />
              Открыть
            </button>
            
            <button
              onClick={onClose}
              style={{
                padding: '8px 12px',
                background: '#f5f5f5',
                color: '#666',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ✕ Закрыть
            </button>
          </div>
        </div>

        {/* Контент */}
        <div style={{ textAlign: 'center' }}>
          {isPDF ? (
            <div>
              <iframe
                src={receiptUrl}
                width="800"
                height="600"
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  maxWidth: '100%'
                }}
                title="PDF чек"
              />
              <div style={{
                marginTop: '12px',
                fontSize: '14px',
                color: '#666'
              }}>
                Если PDF не отображается, нажмите "Открыть" или "Скачать"
              </div>
            </div>
          ) : (
            <img
              src={receiptUrl}
              alt="Чек об оплате"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.innerHTML = `
                  <div style="padding: 40px; text-align: center; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
                    <div>Не удалось загрузить изображение</div>
                    <div style="font-size: 12px; margin-top: 8px;">Попробуйте открыть в новой вкладке</div>
                  </div>
                `;
                target.parentNode?.appendChild(errorDiv);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewer;