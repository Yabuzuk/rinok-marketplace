# 🚀 Инструкция по деплою Rinok

## Текущий статус
- ✅ Firebase проект: `asia-sib`
- ✅ Vercel проект: `rinok` (ID: prj_UQDJUxLmznLKM9Tiimf0VbVoPiuX)

## Быстрый деплой

### Firebase Hosting (Рекомендуется)
```bash
# 1. Установите Firebase CLI (если еще не установлен)
npm install -g firebase-tools

# 2. Войдите в аккаунт
firebase login

# 3. Деплой
npm run deploy
```

### Vercel
```bash
# Windows
deploy-vercel.bat

# Или вручную
vercel --prod
```

## Настройка переменных окружения

### Для Firebase
Добавьте переменные через Firebase Console:
1. Откройте https://console.firebase.google.com/project/asia-sib/settings/general
2. Настройте Firebase Config в коде

### Для Vercel
```bash
# Добавьте переменные через CLI
vercel env add REACT_APP_FIREBASE_API_KEY
vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN
vercel env add REACT_APP_FIREBASE_PROJECT_ID
vercel env add REACT_APP_YANDEX_DELIVERY_TOKEN
vercel env add REACT_APP_YANDEX_GEOCODER_KEY
vercel env add REACT_APP_ONESIGNAL_APP_ID

# Или через веб-интерфейс: https://vercel.com/team_se71duoQ3oUoTK3CnWIOEnpx/rinok/settings/environment-variables
```

## Проверка после деплоя

### Firebase
URL: https://asia-sib.web.app или https://asia-sib.firebaseapp.com

### Vercel
URL: https://rinok.vercel.app (или ваш кастомный домен)

## Что деплоится
- React приложение (фронтенд)
- API функции (Vercel Functions или Firebase Functions)
- Статические файлы (изображения, иконки)
- Service Workers (PWA)

## Troubleshooting

### Ошибка сборки
```bash
# Очистите кеш и пересоберите
rm -rf node_modules build
npm install
npm run build
```

### Firebase: Permission denied
```bash
firebase login --reauth
```

### Vercel: Build failed
Проверьте переменные окружения в настройках проекта
