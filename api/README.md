# Rinok Push Notifications API

Serverless API для отправки push-уведомлений через OneSignal, развернутый на Vercel.

## 🚀 Деплой

### Автоматический деплой
```bash
# Linux/Mac
./deploy-vercel.sh

# Windows
deploy-vercel.bat
```

### Ручной деплой
```bash
# Установка Vercel CLI
npm install -g vercel

# Логин в Vercel
vercel login

# Деплой
vercel --prod
```

## 🔧 Настройка переменных окружения

В панели Vercel добавьте переменные:
- `ONESIGNAL_APP_ID` - ID приложения OneSignal
- `ONESIGNAL_REST_API_KEY` - REST API ключ OneSignal

## 📡 API Endpoints

### POST /api/send-notification

Отправляет push-уведомление через OneSignal.

**Request Body:**
```json
{
  "userIds": ["user1", "user2"],
  "title": "Заголовок уведомления",
  "message": "Текст уведомления",
  "data": {
    "orderId": "12345",
    "type": "order_update"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "notification-id",
    "recipients": 2
  }
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

## 🔒 CORS

API настроен для работы с любыми доменами (`Access-Control-Allow-Origin: *`).

## 🧪 Тестирование

```bash
curl -X POST https://rinok.vercel.app/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["test-user"],
    "title": "Тест",
    "message": "Тестовое уведомление"
  }'
```

## 📱 Интеграция в приложение

```typescript
import { sendServerNotification } from './utils/notifications'

// Отправка уведомления
await sendServerNotification(
  ['user123'], 
  'Новый заказ', 
  'У вас новый заказ #12345',
  { orderId: '12345', type: 'new_order' }
)
```