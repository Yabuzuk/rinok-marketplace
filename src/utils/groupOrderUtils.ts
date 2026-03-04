import { GroupOrderParticipant } from '../types';

// Генерация кода совместного заказа (SOSEDI-XXXX)
export const generateGroupCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'SOSEDI-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Расчет долей доставки пропорционально весу заказа
export const calculateDeliveryShares = (
  participants: GroupOrderParticipant[],
  totalDeliveryCost: number
): GroupOrderParticipant[] => {
  // Вычисляем вес для каждого участника (1 quantity = 1 kg)
  const participantsWithWeight = participants.map(p => ({
    ...p,
    totalWeight: p.items.reduce((sum, item) => sum + item.quantity, 0)
  }));
  
  const totalWeight = participantsWithWeight.reduce((sum, p) => sum + p.totalWeight, 0);
  
  if (totalWeight === 0) return participantsWithWeight;

  return participantsWithWeight.map(participant => ({
    ...participant,
    deliveryShare: Math.round((participant.totalWeight / totalWeight) * totalDeliveryCost)
  }));
};

// Форматирование даты
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long',
    weekday: 'short'
  };
  return date.toLocaleDateString('ru-RU', options);
};

// Получить метку дня (Сегодня/Завтра/Послезавтра)
export const getDayLabel = (dateString: string): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Завтра';
  if (diffDays === 2) return 'Послезавтра';
  
  return formatDate(dateString);
};
