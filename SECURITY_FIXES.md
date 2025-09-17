# Критические исправления безопасности для Rinok

## 1. Удаление хардкод токенов

### Проблема
Telegram Bot API токен захардкожен в коде (src/utils/api.ts:67-68)

### Исправление
```typescript
// Заменить хардкод токен на переменную окружения
const TELEGRAM_BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
```

## 2. Добавление аутентификации

### Проблема
API endpoints не защищены аутентификацией

### Исправление
Добавить middleware для проверки JWT токенов:
```javascript
// server/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

## 3. Защита от CSRF

### Проблема
Отсутствует CSRF защита для state-changing запросов

### Исправление
```javascript
const csrf = require('csurf');
app.use(csrf({ cookie: true }));
```

## 4. Санитизация логов

### Проблема
Пользовательский ввод логируется без санитизации

### Исправление
```typescript
const sanitizeForLog = (input: string) => {
  return input.replace(/[\r\n\t]/g, '_');
};

console.log('User action:', sanitizeForLog(userInput));
```