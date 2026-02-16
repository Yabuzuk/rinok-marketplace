# ✅ Тесты Тинькофф пройдены! Финальный чеклист

## Что сделано:

### 1. ✅ Боевая версия восстановлена
- Терминал: `1771142972317` (production)
- Пароль: `c*FXLaGF!&4Kn^8*`
- Receipt с правильным форматом (Email + Phone)

### 2. ✅ Задеплоено на Firebase
- URL: https://asia-sib.web.app
- Боевой терминал активен

### 3. ⚠️ Осталось настроить webhook в Тинькофф

## Следующий шаг: Настройка webhook

1. Зайти в личный кабинет Тинькофф Бизнес
2. Перейти в настройки терминала `1771142972317`
3. Добавить URL webhook: `https://rinok.vercel.app/api/tinkoff-webhook`
4. Сохранить настройки

## Проверка работы:

1. Создать тестовый заказ на https://asia-sib.web.app
2. Оплатить реальной картой (минимальная сумма)
3. Проверить:
   - ✅ Платёж прошёл в Тинькофф
   - ✅ Webhook обновил статус заказа в Firebase
   - ✅ Заказ изменил статус на "paid"

## Важные файлы:

- `src/utils/tinkoff.ts` - боевая версия с правильным Receipt
- `api/tinkoff-webhook.js` - обработчик webhook на Vercel
- `WEBHOOK_SETUP_GUIDE.md` - инструкция по настройке webhook

## Receipt формат (для справки):

```javascript
Receipt: {
  Email: customerEmail || 'noreply@rinok.ru',
  Phone: '+79139492570',
  Taxation: 'usn_income',
  Items: [{
    Name: description,
    Price: amount * 100,
    Quantity: 1.00,
    Amount: amount * 100,
    Tax: 'none',
    PaymentMethod: 'full_payment',
    PaymentObject: 'service'
  }]
}
```

## 🎉 Готово к приёму реальных платежей!

После настройки webhook система полностью готова к работе.
