# Проверка системы уведомлений

## Текущая конфигурация

### OneSignal
- **App ID**: `ddd6a3d4-163c-4769-81d3-0fbe83a1c991`
- **REST API Key**: настроен в `.env.vercel`
- **SDK**: подключен через CDN в `index.html`

### API Endpoint
- **URL**: `https://rinok.vercel.app/api/send-notification`
- **Метод**: POST
- **Файл**: `/api/send-notification.js`

## Как проверить работу уведомлений

### 1. Проверка переменных окружения на Vercel
```bash
# Перейдите на https://vercel.com/dashboard
# Откройте проект rinok
# Settings → Environment Variables
# Убедитесь, что добавлены:
ONESIGNAL_APP_ID=ddd6a3d4-163c-4769-81d3-0fbe83a1c991
ONESIGNAL_REST_API_KEY=nv724ndk2usnuxciwagw5vqqu
```

### 2. Проверка подписки пользователя
1. Откройте сайт: https://asia-sib.web.app
2. Войдите как покупатель или продавец
3. Разрешите уведомления в браузере
4. Откройте консоль браузера (F12)
5. Должно быть: `✅ OneSignal: User subscribed: [userId]`

### 3. Проверка отправки уведомлений
1. Создайте тестовый заказ как покупатель
2. В консоли должно быть:
   - `🔔 Sending notification: ОптБазар - Новый заказ!`
   - `✅ Server notification sent`
3. Продавец должен получить уведомление

### 4. Проверка в OneSignal Dashboard
1. Откройте: https://onesignal.com/
2. Войдите в аккаунт
3. Выберите приложение `rinok`
4. Проверьте:
   - **Audience** → количество подписанных пользователей
   - **Messages** → отправленные уведомления
   - **Delivery** → статистика доставки

## Точки отправки уведомлений

### Покупателю:
- ✅ Доставка добавлена (status: `payment_pending`)
- ✅ Заказ собран (status: `ready`)
- ✅ Заказ в доставке (status: `delivering`)
- ✅ Заказ доставлен (status: `delivered`)
- ✅ Заказ изменен продавцом

### Продавцу:
- ✅ Новый заказ создан
- ✅ Заказ оплачен (status: `paid`)
- ✅ Покупатель подтвердил изменения

### Менеджеру:
- ✅ Заказ оплачен (status: `paid`)
- ✅ Заказ готов к отправке (status: `ready`)
- ✅ Все участники оплатили товары (групповой заказ)
- ✅ Все участники оплатили доставку (групповой заказ)

## Возможные проблемы

### Уведомления не приходят
1. **Проверьте переменные окружения на Vercel**
2. **Проверьте разрешения браузера** (chrome://settings/content/notifications)
3. **Проверьте консоль браузера** на ошибки
4. **Проверьте OneSignal Dashboard** → Messages

### Дублирование уведомлений
- Удалите `firebase-messaging-sw.js` (не используется)
- Используется только OneSignal

### Уведомления не работают на iOS
- Safari требует добавления в Home Screen (PWA)
- Или используйте Chrome/Firefox на iOS

## Тестирование

### Быстрый тест через OneSignal Dashboard
1. Откройте OneSignal Dashboard
2. Messages → New Push
3. Audience → Select Users → введите userId
4. Отправьте тестовое уведомление

### Тест через приложение
```javascript
// В консоли браузера:
await fetch('https://rinok.vercel.app/api/send-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userIds: ['test_customer_123'],
    title: 'Тест',
    message: 'Тестовое уведомление'
  })
}).then(r => r.json()).then(console.log)
```

## Рекомендации по улучшению

1. **Удалить Firebase Messaging** - не используется, может конфликтовать
2. **Добавить retry логику** - повторная отправка при ошибках
3. **Логирование** - сохранять историю отправленных уведомлений
4. **Настройки пользователя** - возможность отключить уведомления
5. **Группировка** - объединять похожие уведомления
