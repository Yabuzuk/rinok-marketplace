const ONESIGNAL_APP_ID = '16b0499f-1314-410b-a9c3-8be5c4c5b0c4';
const ONESIGNAL_REST_API_KEY = 'os_v2_app_c2yethytcraqxkodrps4jrnqytezm2d2kbkue7espzfysbnacvdpxc64asntat7t4z5aaqawgj67k4dvfmg4mzcgrpxyxcoemndbhgq';

export const sendPushNotification = async (
  title: string,
  message: string,
  userIds: string[],
  url?: string
) => {
  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        headings: { ru: title, en: title },
        contents: { ru: message, en: message },
        include_external_user_ids: userIds,
        url: url || 'https://xn--80aabz6agll.xn--p1ai/',
        chrome_web_icon: 'https://xn--80aabz6agll.xn--p1ai/icon-192x192.png',
        firefox_icon: 'https://xn--80aabz6agll.xn--p1ai/icon-192x192.png'
      })
    });

    const result = await response.json();
    console.log('Push notification sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

// Уведомления для разных событий
export const notifyNewOrder = (sellerId: string, orderTotal: number) => {
  return sendPushNotification(
    'Новый заказ!',
    `Поступил заказ на сумму ${orderTotal}₽`,
    [sellerId]
  );
};

export const notifyOrderStatus = (customerId: string, status: string) => {
  const statusMessages = {
    confirmed: 'Ваш заказ подтвержден',
    preparing: 'Ваш заказ готовится',
    ready: 'Ваш заказ готов к получению',
    delivering: 'Ваш заказ в пути',
    delivered: 'Ваш заказ доставлен'
  };

  return sendPushNotification(
    'Статус заказа',
    statusMessages[status as keyof typeof statusMessages] || 'Статус заказа изменен',
    [customerId]
  );
};