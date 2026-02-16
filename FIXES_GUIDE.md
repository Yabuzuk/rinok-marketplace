# 🔧 Инструкция по применению исправлений

## Что исправлено:

### ✅ 1. Безопасность: Пароль перенесён на backend
- **Файл**: `api/tinkoff-init.js`
- **Что**: Инициализация платежей теперь через backend
- **Зачем**: Пароль терминала больше не виден в браузере

### ✅ 2. Исправлен баг в webhook
- **Файл**: `api/tinkoff-webhook.js`
- **Что**: Исправлена проверка токена
- **Зачем**: Webhook теперь правильно проверяет подпись Тинькофф

### ✅ 3. Безопасный клиентский API
- **Файл**: `src/utils/tinkoff-secure.ts`
- **Что**: Новый API без пароля
- **Зачем**: Клиент вызывает backend вместо прямого обращения к Тинькофф

### ✅ 4. Исправлен баг с uniqueOrderId
- **Файл**: `src/utils/tinkoff-secure.ts`
- **Что**: Используется sessionStorage для предотвращения дублей
- **Зачем**: Один заказ = один платёж, даже при повторных нажатиях

### ✅ 5. Debounce для Yandex API
- **Файл**: `src/hooks/useAddressSuggestions.ts`
- **Что**: Хук с debounce 500ms
- **Зачем**: Меньше запросов к API, лучше производительность

---

## Как применить:

### Шаг 1: Деплой backend функций на Vercel

```bash
# Убедитесь что файлы созданы:
# - api/tinkoff-init.js (новый)
# - api/tinkoff-webhook.js (обновлён)

npx vercel --prod
```

### Шаг 2: Обновить CustomerDashboard.tsx

Заменить импорт:
```typescript
// Было:
import { initPayment } from '../utils/tinkoff';

// Стало:
import { initPayment, createUniqueOrderId, clearPaymentSession } from '../utils/tinkoff-secure';
```

Обновить код оплаты (2 места):
```typescript
// Было:
const uniqueOrderId = `${order.id}_${Date.now()}`;
const response = await initPayment(
  uniqueOrderId,
  totalAmount,
  `Оплата заказа №${order.id.slice(-6)}`,
  undefined,
  'O'
);

// Стало:
const uniqueOrderId = createUniqueOrderId(order.id);
const response = await initPayment(
  uniqueOrderId,
  totalAmount,
  `Оплата заказа №${order.id.slice(-6)}`,
  user.email
);
```

Обновить useEffect для очистки:
```typescript
if (paymentStatus === 'success') {
  alert('✅ Платеж успешно выполнен!');
  clearPaymentSession(orderId); // Добавить эту строку
  onUpdateOrder?.(orderId, { 
    status: 'paid',
    paidAt: new Date().toISOString()
  } as any);
}
```

### Шаг 3: Использовать хук для адресов (опционально)

В CustomerDashboard.tsx:
```typescript
import { useAddressSuggestions } from '../hooks/useAddressSuggestions';

// В компоненте:
const { query, setQuery, suggestions, loading } = useAddressSuggestions();

// В input:
<input 
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Начните вводить адрес..."
/>

// Показывать suggestions вместо addressSuggestions
```

### Шаг 4: Деплой на Firebase

```bash
npm run build
npx firebase deploy --only hosting
```

---

## Что ещё можно улучшить (не критично):

### 📝 Средний приоритет:

1. **Индикаторы загрузки**
   - Добавить spinner при оплате
   - Показывать "Обрабатываем платёж..."

2. **Toast уведомления**
   - Заменить alert() на красивые уведомления
   - Библиотека: react-hot-toast или react-toastify

3. **Валидация email**
   - Проверять формат email перед отправкой
   - Показывать ошибку если невалидный

4. **Проверка минимальной суммы**
   - СБП работает от 10₽
   - Показывать предупреждение если меньше

### 🎨 Низкий приоритет:

5. **Убрать неиспользуемые импорты**
   - Clock, product, isFullyPaid и др.
   - Запустить: `npm run lint --fix`

6. **Мемоизация вычислений**
   - Использовать useMemo для тяжёлых вычислений
   - Особенно для reduce() в render

7. **Переменные окружения**
   - Yandex API key в .env
   - Vercel API URL в .env

---

## Проверка после применения:

### ✅ Чеклист:

- [ ] Backend функции задеплоены на Vercel
- [ ] Webhook работает (проверить в логах Vercel)
- [ ] Клиент использует новый API
- [ ] Пароль не виден в браузере (проверить Network tab)
- [ ] Платежи проходят успешно
- [ ] Повторное нажатие не создаёт дубли
- [ ] Адреса подгружаются с задержкой (debounce)

### 🧪 Тестирование:

1. Создать заказ
2. Нажать "Оплатить" несколько раз быстро
3. Проверить что создался только 1 платёж
4. Оплатить тестовой картой
5. Проверить что webhook обновил статус
6. Проверить что sessionStorage очистился

---

## 🆘 Если что-то сломалось:

### Откат изменений:

```bash
# Вернуть старую версию tinkoff.ts
git checkout HEAD -- src/utils/tinkoff.ts

# Пересобрать и задеплоить
npm run build
npx firebase deploy --only hosting
```

### Проверка логов:

```bash
# Vercel логи
npx vercel logs

# Firebase логи
npx firebase functions:log
```

---

## 📊 Результат:

**До исправлений:**
- ❌ Пароль в браузере
- ❌ Неправильная проверка webhook
- ❌ Дубли платежей
- ❌ Много запросов к Yandex

**После исправлений:**
- ✅ Пароль на сервере
- ✅ Правильная проверка webhook
- ✅ Один заказ = один платёж
- ✅ Оптимизированные запросы

**Безопасность**: 🔴 → 🟢  
**Надёжность**: 🟡 → 🟢  
**Производительность**: 🟡 → 🟢
