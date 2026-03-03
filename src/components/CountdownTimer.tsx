import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetTime: string | Date;
  onExpire?: () => void;
  showIcon?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  targetTime, 
  onExpire,
  showIcon = true 
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetTime).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Время истекло');
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}ч ${minutes}мин`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}мин ${seconds}сек`);
      } else {
        setTimeLeft(`${seconds}сек`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onExpire]);

  const getColor = () => {
    if (isExpired) return '#f44336';
    const now = new Date().getTime();
    const target = new Date(targetTime).getTime();
    const diff = target - now;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes <= 5) return '#f44336';
    if (minutes <= 15) return '#ff9800';
    return '#4caf50';
  };

  return (
    <span style={{ 
      color: getColor(), 
      fontWeight: 'bold',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px'
    }}>
      {showIcon && <span>{isExpired ? '⏰' : '⏱️'}</span>}
      {timeLeft}
    </span>
  );
};
