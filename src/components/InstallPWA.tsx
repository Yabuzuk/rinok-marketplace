import React from 'react';
import { Download } from 'lucide-react';
import usePWA from '../hooks/usePWA';

const InstallPWA: React.FC = () => {
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 1000
    }} onClick={installApp}>
      <Download size={18} />
      Установить приложение
    </div>
  );
};

export default InstallPWA;