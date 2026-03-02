@echo off
echo ========================================
echo   Деплой Rinok на Firebase Hosting
echo ========================================
echo.

echo [1/3] Сборка проекта...
call npm run build
if %errorlevel% neq 0 (
    echo Ошибка при сборке!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Проверка Firebase...
call npx firebase-tools projects:list

echo.
echo [3/3] Деплой на Firebase Hosting...
call npx firebase-tools deploy --only hosting

echo.
echo ========================================
echo   Деплой завершен!
echo   URL: https://asia-sib.web.app
echo ========================================
pause
