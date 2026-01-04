# 🔧 Настройка переменных окружения в Vercel

## Проблема
API возвращает ошибку авторизации OneSignal, потому что переменные окружения не настроены в Vercel Dashboard.

## Решение

### 1. Откройте Vercel Dashboard
https://vercel.com/alexs-projects-9eafa371/rinok/settings/environment-variables

### 2. Добавьте переменные окружения:

**ONESIGNAL_APP_ID**
- Value: `ddd6a3d4-163c-4769-81d3-0fbe83a1c991`
- Environment: Production, Preview, Development

**ONESIGNAL_REST_API_KEY**  
- Value: `nv724ndk2usnuxciwagw5vqqu`
- Environment: Production, Preview, Development

### 3. Пересоберите проект
После добавления переменных выполните:
```bash
vercel --prod
```

## Текущий статус
✅ API функция развернута и работает
✅ Локальные PWA уведомления работают
⚠️ OneSignal требует настройки переменных окружения
✅ Fallback режим активен (приложение работает без OneSignal)

## Тестирование
После настройки переменных:
```bash
curl -X POST https://rinok.vercel.app/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{"title": "Тест", "message": "OneSignal работает!"}'
```