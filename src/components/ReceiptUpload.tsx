import React, { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface ReceiptUploadProps {
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => void;
  currentReceipt?: string;
  disabled?: boolean;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  onUpload,
  onRemove,
  currentReceipt,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (disabled || uploading) return;
    
    // Проверяем тип файла (изображения + PDF)
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    
    if (!isImage && !isPDF) {
      alert('Пожалуйста, загрузите изображение или PDF чека');
      return;
    }
    
    // Проверяем размер файла (макс 10MB для PDF, 5MB для изображений)
    const maxSize = isPDF ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Размер файла не должен превышать ${isPDF ? '10MB' : '5MB'}`);
      return;
    }
    
    setUploading(true);
    try {
      const url = await onUpload(file);
      console.log('✅ Файл успешно загружен:', url);
    } catch (error) {
      console.error('❌ Ошибка загрузки чека:', error);
      alert('Ошибка загрузки чека. Попробуйте еще раз.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  if (currentReceipt) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: '#e8f5e8',
        borderRadius: '8px',
        border: '1px solid #4caf50'
      }}>
        <FileText size={16} style={{ color: '#4caf50' }} />
        <span style={{ fontSize: '14px', color: '#2e7d32', flex: 1 }}>
          Чек загружен
        </span>
        <button
          onClick={() => window.open(currentReceipt, '_blank')}
          style={{
            background: 'none',
            border: 'none',
            color: '#4caf50',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline'
          }}
        >
          Просмотр
        </button>
        {onRemove && (
          <button
            onClick={onRemove}
            style={{
              background: 'none',
              border: 'none',
              color: '#f44336',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      style={{
        border: `2px dashed ${dragOver ? '#4caf50' : '#d4c4b0'}`,
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
        background: dragOver ? '#f8fff8' : disabled ? '#f5f5f5' : '#f9f5f0',
        cursor: disabled || uploading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
    >
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileInput}
        disabled={disabled || uploading}
        style={{ display: 'none' }}
        id="receipt-upload"
      />
      
      <label
        htmlFor="receipt-upload"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: disabled || uploading ? 'not-allowed' : 'pointer'
        }}
      >
        <Upload 
          size={24} 
          style={{ 
            color: uploading ? '#999' : '#8b4513',
            animation: uploading ? 'spin 1s linear infinite' : 'none'
          }} 
        />
        <div style={{ fontSize: '14px', color: uploading ? '#999' : '#8b4513' }}>
          {uploading ? 'Загрузка...' : 'Прикрепить чек об оплате'}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Перетащите файл или нажмите для выбора<br/>
          (Изображения до 5MB, PDF до 10MB)
        </div>
      </label>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ReceiptUpload;