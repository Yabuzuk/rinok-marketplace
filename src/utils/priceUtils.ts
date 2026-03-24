/**
 * Утилиты для работы с ценами
 */

/**
 * Рассчитывает цену для покупателя с наценкой 10% и округлением до рубля
 * @param basePrice - базовая цена товара
 * @returns цена с наценкой 10%, округленная до рубля
 */
export const calculateCustomerPrice = (basePrice: number): number => {
  return Math.round(basePrice * 1.10); // +10% и округление до рубля
};

/**
 * Возвращает цену в зависимости от роли пользователя
 * @param basePrice - базовая цена товара
 * @param userRole - роль пользователя ('customer', 'seller', 'manager', 'admin', 'courier')
 * @returns цена для отображения
 */
export const getDisplayPrice = (basePrice: number, userRole?: string | null): number => {
  // Продавцы, менеджеры и админы видят базовую цену
  if (userRole === 'seller' || userRole === 'manager' || userRole === 'admin') {
    return basePrice;
  }
  
  // Покупатели и гости видят цену с наценкой
  return calculateCustomerPrice(basePrice);
};
