import { DeliveryPool, DELIVERY_TIME_SLOTS } from '../types';
import { getDayLabel } from './groupOrderUtils';

// Группировка пулов по датам
export const groupPoolsByDate = (pools: DeliveryPool[]): Record<string, DeliveryPool[]> => {
  return pools.reduce((acc, pool) => {
    if (!acc[pool.date]) {
      acc[pool.date] = [];
    }
    acc[pool.date].push(pool);
    return acc;
  }, {} as Record<string, DeliveryPool[]>);
};

// Получить текст статуса пула
export const getPoolStatusText = (pool: DeliveryPool): string => {
  if (pool.status === 'closed') {
    return 'Закрыт';
  }
  
  const now = new Date();
  const closeTime = new Date(pool.closeTime);
  const diffMs = closeTime.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Закрывается...';
  }
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (hours > 0) {
    return `Закрытие через ${hours}ч ${minutes}мин`;
  }
  
  return `Закрытие через ${minutes} мин`;
};

// Проверить, нужно ли закрыть пул
export const shouldClosePool = (pool: DeliveryPool): boolean => {
  if (pool.status === 'closed') return false;
  
  const now = new Date();
  const closeTime = new Date(pool.closeTime);
  
  return now >= closeTime;
};

// Получить информацию о временном слоте
export const getTimeSlotInfo = (timeSlotId: string) => {
  return DELIVERY_TIME_SLOTS.find(slot => slot.id === timeSlotId);
};

// Форматировать название пула для отображения
export const formatPoolName = (pool: DeliveryPool): string => {
  const dayLabel = getDayLabel(pool.date);
  const slotInfo = getTimeSlotInfo(pool.timeSlot);
  return `${dayLabel}, ${slotInfo?.label || pool.timeSlot}`;
};
