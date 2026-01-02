#!/bin/bash

echo "🔥 Деплой на Firebase Hosting..."

# Сборка проекта
echo "📦 Сборка проекта..."
npm run build

# Деплой на Firebase
echo "🚀 Деплой на Firebase..."
firebase deploy

echo "✅ Деплой завершен!"
echo "🌐 Ваш сайт доступен по адресу из Firebase Console"