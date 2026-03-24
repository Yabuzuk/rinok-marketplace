import { firebaseApi } from './supabaseApi';

export interface VisitorStats {
  date: string;
  uniqueVisitors: number;
  totalPageViews: number;
  newVisitors: number;
  returningVisitors: number;
}

// Генерируем уникальный ID для посетителя
const getVisitorId = (): string => {
  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitorId', visitorId);
  }
  return visitorId;
};

// Проверяем, новый ли это посетитель
const isNewVisitor = (): boolean => {
  const firstVisit = localStorage.getItem('firstVisit');
  if (!firstVisit) {
    localStorage.setItem('firstVisit', new Date().toISOString());
    return true;
  }
  return false;
};

// Записываем посещение
export const trackVisit = async () => {
  try {
    const visitorId = getVisitorId();
    const isNew = isNewVisitor();
    const today = new Date().toISOString().split('T')[0];

    const visit = {
      visitorId,
      timestamp: new Date().toISOString(),
      date: today,
      isNew,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct',
      page: window.location.pathname
    };

    await firebaseApi.trackVisit(visit);
  } catch (error) {
    console.error('Error tracking visit:', error);
  }
};

// Получаем статистику за период
export const getVisitorStats = async (startDate: string, endDate: string): Promise<VisitorStats[]> => {
  try {
    const stats = await firebaseApi.getVisitorStats(startDate, endDate);
    return stats;
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    return [];
  }
};

// Получаем статистику за сегодня
export const getTodayStats = async (): Promise<VisitorStats | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const stats = await firebaseApi.getVisitorStats(today, today);
    return stats.length > 0 ? stats[0] : null;
  } catch (error) {
    console.error('Error getting today stats:', error);
    return null;
  }
};

// Получаем статистику за последние N дней
export const getRecentStats = async (days: number = 7): Promise<VisitorStats[]> => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    return await getVisitorStats(start, end);
  } catch (error) {
    console.error('Error getting recent stats:', error);
    return [];
  }
};
