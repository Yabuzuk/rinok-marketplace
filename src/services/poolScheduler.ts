// Планировщик для автоматического управления пулами доставки

let schedulerInterval: NodeJS.Timeout | null = null;
let warningsSent: Set<string> = new Set(); // Отслеживание отправленных предупреждений
let paymentWarningsSent: Set<string> = new Set(); // Отслеживание предупреждений об оплате

export const startPoolScheduler = (
  onPoolClose: (poolId: string) => void,
  onDeliveryPaymentExpire: (orderId: string) => void,
  getPools: () => any[],
  getOrders: () => any[],
  onPoolClosingWarning?: (poolId: string, participants: string[]) => void,
  onPaymentWarning?: (orderId: string, customerId: string) => void
) => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  schedulerInterval = setInterval(() => {
    const now = new Date();
    const pools = getPools();
    const orders = getOrders();

    // Проверяем пулы на закрытие и предупреждения
    pools.forEach(pool => {
      if (pool.status === 'open' && pool.closeTime) {
        const closeTime = new Date(pool.closeTime);
        const timeDiff = closeTime.getTime() - now.getTime();
        const thirtyMinutes = 30 * 60 * 1000;
        
        // Предупреждение за 30 минут
        if (timeDiff > 0 && timeDiff <= thirtyMinutes && !warningsSent.has(pool.id)) {
          console.log(`⚠️ Предупреждение: пул ${pool.id} закроется через 30 минут`);
          warningsSent.add(pool.id);
          
          // Находим всех участников пула
          const poolOrders = orders.filter((o: any) => pool.orders.includes(o.id));
          const participants = Array.from(new Set(poolOrders.map((o: any) => o.customerId).filter(Boolean)));
          
          if (onPoolClosingWarning && participants.length > 0) {
            onPoolClosingWarning(pool.id, participants);
          }
        }
        
        // Закрытие пула
        if (now >= closeTime) {
          console.log(`🔒 Автоматическое закрытие пула: ${pool.id}`);
          onPoolClose(pool.id);
          warningsSent.delete(pool.id); // Очищаем после закрытия
        }
      }
    });

    // Проверяем таймеры оплаты доставки (25 минут)
    orders.forEach((order: any) => {
      if (order.status === 'payment_pending' && order.deliveryPaymentDeadline) {
        const deadline = new Date(order.deliveryPaymentDeadline);
        const timeDiff = deadline.getTime() - now.getTime();
        const fiveMinutes = 5 * 60 * 1000;
        
        // Предупреждение за 5 минут
        if (timeDiff > 0 && timeDiff <= fiveMinutes && !paymentWarningsSent.has(order.id)) {
          console.log(`⚠️ Предупреждение: осталось 5 минут для оплаты заказа ${order.id}`);
          paymentWarningsSent.add(order.id);
          
          if (onPaymentWarning && order.customerId) {
            onPaymentWarning(order.id, order.customerId);
          }
        }
        
        // Истечение таймера
        if (now >= deadline) {
          console.log(`⏰ Истек таймер оплаты доставки: ${order.id}`);
          onDeliveryPaymentExpire(order.id);
          paymentWarningsSent.delete(order.id); // Очищаем после истечения
        }
      }
    });
  }, 60000); // Проверка каждую минуту

  console.log('✅ Планировщик пулов запущен');
};

export const stopPoolScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    warningsSent.clear();
    paymentWarningsSent.clear();
    console.log('⏹️ Планировщик пулов остановлен');
  }
};

// Проверка, нужно ли отправить предупреждение (за 5 минут до истечения)
export const shouldSendWarning = (deadline: string): boolean => {
  const now = new Date();
  const deadlineTime = new Date(deadline);
  const diff = deadlineTime.getTime() - now.getTime();
  const fiveMinutes = 5 * 60 * 1000;
  
  return diff > 0 && diff <= fiveMinutes;
};
