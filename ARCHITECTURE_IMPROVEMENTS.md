# Улучшения архитектуры Rinok

## 1. Разделение больших компонентов

### App.tsx (362 строки) → Разделить на:
- `hooks/useAuth.ts` - логика аутентификации
- `hooks/useCart.ts` - логика корзины  
- `hooks/useProducts.ts` - логика товаров
- `components/AppLayout.tsx` - основной layout

### SellerDashboard.tsx (736 строк) → Разделить на:
- `components/ProductForm.tsx`
- `components/ProductList.tsx` 
- `components/AnalyticsView.tsx`
- `hooks/useProductManagement.ts`

## 2. Улучшение обработки ошибок

### Заменить alert() на Toast компоненты:
```typescript
// components/Toast.tsx
interface ToastProps {
  message: string;
  type: 'error' | 'success' | 'warning';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div className={`toast toast-${type}`}>
      {message}
      <button onClick={onClose}>×</button>
    </div>
  );
};
```

## 3. Оптимизация производительности

### Мемоизация вычислений:
```typescript
const processedOrders = useMemo(() => 
  orders.map(order => ({
    ...order,
    customerName: 'Покупатель'
  })), [orders]
);
```

### Debounce для resize events:
```typescript
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: any[]) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};
```

## 4. Типизация

### Заменить any[] на строгие типы:
```typescript
interface HomePageProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  users: User[]; // вместо any[]
}
```