@echo off
echo 🚀 Деплой Rinok на Vercel...

REM Проверяем установку Vercel CLI
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI не установлен. Устанавливаем...
    npm install -g vercel
)

REM Логинимся в Vercel (если нужно)
echo 🔐 Проверяем авторизацию в Vercel...
vercel whoami || vercel login

REM Деплоим проект
echo 📦 Деплоим проект...
vercel --prod

echo ✅ Деплой завершен!
echo 🌐 Ваш API доступен по адресу: https://rinok.vercel.app/api/send-notification
pause