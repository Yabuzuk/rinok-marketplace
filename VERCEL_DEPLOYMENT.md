# 🚀 Rinok Push Notifications - Vercel Deployment

## ✅ Статус деплоя
- **Frontend**: https://rinok.vercel.app
- **API**: https://rinok.vercel.app/api/send-notification
- **Статус**: УСПЕШНО РАЗВЕРНУТО

## 📡 API Endpoint

### POST /api/send-notification

**URL**: `https://rinok.vercel.app/api/send-notification`

**Пример запроса**:
```bash
curl -X POST https://rinok.vercel.app/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["user123"],
    "title": "Новый заказ",
    "message": "У вас новый заказ #12345",
    "data": {
      "orderId": "12345",
      "type": "new_order"
    }
  }'
```

**Пример ответа**:
```json
{
  "success": true,
  "data": {
    "id": "notification-id",
    "recipients": 1
  }
}
```

## 🔧 Интеграция в приложение

Обновленная функция `sendNotification` автоматически использует Vercel API:

```typescript
import { sendNotification } from './utils/notifications'

// Отправка уведомления
await sendNotification(
  ['user123'], 
  'Новый заказ', 
  'У вас новый заказ #12345',
  { orderId: '12345', type: 'new_order' }
)
```

## 🔒 Переменные окружения

В панели Vercel настройте:
- `ONESIGNAL_APP_ID` = `ddd6a3d4-163c-4769-81d3-0fbe83a1c991`
- `ONESIGNAL_REST_API_KEY` = `nv724ndk2usnuxciwagw5vqqu`

## 📁 Файлы проекта

### Созданные файлы:
- `api/send-notification.js` - Serverless функция
- `vercel.json` - Конфигурация Vercel
- `.env.vercel` - Переменные окружения
- `deploy-vercel.sh` / `deploy-vercel.bat` - Скрипты деплоя
- `api/README.md` - Документация API

### Обновленные файлы:
- `src/utils/notifications.ts` - Интеграция с Vercel API

## 🔄 Повторный деплой

```bash
# Быстрый деплой
vercel --prod

# Или используйте скрипты
./deploy-vercel.sh    # Linux/Mac
deploy-vercel.bat     # Windows
```

## 🧪 Тестирование

1. **Локальное тестирование**:
```bash
vercel dev
```

2. **Тест API**:
```bash
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{"userIds":["test"],"title":"Тест","message":"Локальный тест"}'
```

## 🎯 Следующие шаги

1. Настроить переменные окружения в Vercel Dashboard
2. Протестировать отправку уведомлений
3. Интегрировать в основное приложение
4. Настроить мониторинг и логирование

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи в Vercel Dashboard
2. Убедитесь в правильности переменных окружения
3. Проверьте настройки OneSignal