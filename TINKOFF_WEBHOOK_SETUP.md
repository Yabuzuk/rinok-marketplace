# Настройка Tinkoff Webhook

## 1. Добавить переменные окружения в Vercel

Зайти в Vercel Dashboard → Settings → Environment Variables и добавить:

```
FIREBASE_PROJECT_ID=asia-sib
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@asia-sib.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nXXXXX\n-----END PRIVATE KEY-----
```

**Где взять эти данные:**
1. Firebase Console → Project Settings → Service Accounts
2. Нажать "Generate new private key"
3. Скачается JSON файл с этими данными

## 2. Задеплоить на Vercel

```bash
vercel --prod
```

## 3. Настроить в Тинькофф

1. Зайти в личный кабинет Тинькофф Бизнес
2. Эквайринг → Настройки терминала `1771142972317`
3. Найти поле "URL для уведомлений" (Notification URL)
4. Указать: `https://ваш-домен.vercel.app/api/tinkoff-webhook`
5. Сохранить

## 4. Проверка

После настройки при каждой оплате:
- Тинькофф отправит POST на ваш webhook
- Функция проверит токен
- Обновит статус заказа в Firestore
- Пользователь увидит обновленный статус

## Статусы Тинькофф

- `CONFIRMED` - оплата успешна → статус заказа меняется на `paid`
- `REJECTED` - оплата отклонена
- `CANCELED` - оплата отменена

## Логи

Смотреть логи в Vercel Dashboard → Deployments → Functions → Logs
