#!/bin/bash

echo "🚀 Деплой Rinok на Vercel..."

# Проверяем установку Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен. Устанавливаем..."
    npm install -g vercel
fi

# Логинимся в Vercel (если нужно)
echo "🔐 Проверяем авторизацию в Vercel..."
vercel whoami || vercel login

# Устанавливаем переменные окружения
echo "🔧 Настраиваем переменные окружения..."
vercel env add ONESIGNAL_APP_ID production
vercel env add ONESIGNAL_REST_API_KEY production

# Деплоим проект
echo "📦 Деплоим проект..."
vercel --prod

echo "✅ Деплой завершен!"
echo "🌐 Ваш API доступен по адресу: https://rinok.vercel.app/api/send-notification"