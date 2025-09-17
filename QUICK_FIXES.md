# Быстрые исправления для Rinok

## Приоритет 1: Безопасность (КРИТИЧНО)

### 1. Удалить хардкод токены
```bash
# В src/utils/api.ts строка 67-68
# УДАЛИТЬ: const TELEGRAM_BOT_TOKEN = '7991123999:AAFsFnrAfySNgR3k2QRytrZr7FNh4_xd_Tg';
# ЗАМЕНИТЬ НА:
const TELEGRAM_BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
```

### 2. Добавить аутентификацию в server.js
```javascript
// Добавить перед API routes:
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  // Простая проверка для демо
  if (token === 'demo-token') {
    req.user = { id: 'demo' };
    next();
  } else {
    res.sendStatus(403);
  }
};

// Защитить POST/PUT/DELETE routes:
app.post('/api/products', authenticateToken, async (req, res) => {
```

## Приоритет 2: Производительность

### 3. Мемоизация в App.tsx
```typescript
const processedOrders = useMemo(() => 
  orders.map(order => ({
    ...order,
    customerName: 'Покупатель'
  })), [orders]
);
```

### 4. Debounce в EmojiBackground.tsx
```typescript
const debouncedResize = useCallback(
  debounce(() => generateEmojis(), 300),
  []
);

useEffect(() => {
  window.addEventListener('resize', debouncedResize);
  return () => window.removeEventListener('resize', debouncedResize);
}, [debouncedResize]);
```

## Приоритет 3: Обработка ошибок

### 5. Заменить alert() на Toast
```typescript
// Создать components/Toast.tsx
const Toast = ({ message, type, onClose }) => (
  <div className={`toast ${type}`}>
    {message}
    <button onClick={onClose}>×</button>
  </div>
);

// Использовать вместо alert():
setToast({ message: 'Ошибка сохранения', type: 'error' });
```

### 6. Добавить проверки null
```typescript
// В HomePage.tsx строка 162-165:
const handleAddToCart = (e) => {
  if (e.currentTarget.parentElement) {
    e.currentTarget.parentElement.innerHTML = '📦';
  }
};
```

## Приоритет 4: Обновление зависимостей

### 7. Обновить уязвимые пакеты
```bash
npm audit fix
npm update nth-check
```

## Приоритет 5: Рефакторинг

### 8. Разделить большие компоненты
- App.tsx (362 строки) → useAuth, useCart, useProducts hooks
- SellerDashboard.tsx (736 строк) → ProductForm, ProductList, AnalyticsView

### 9. Улучшить типизацию
```typescript
// Заменить any[] на User[]
interface HomePageProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  users: User[];
}
```