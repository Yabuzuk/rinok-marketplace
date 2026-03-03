# 🔗 СПОСОБЫ ПРИСОЕДИНЕНИЯ К СОВМЕСТНОМУ ЗАКАЗУ

## Три способа для соседей присоединиться:

1. **Ввод кода вручную** - через модальное окно
2. **Прямая ссылка** - клик по ссылке
3. **QR-код** - сканирование камерой телефона

---

## 📱 РЕАЛИЗАЦИЯ

### 1. Установка библиотеки для QR-кода

```bash
npm install qrcode.react
npm install @types/qrcode.react --save-dev
```

---

### 2. Модальное окно после создания заказа

**После создания совместного заказа показываем:**

```tsx
// src/components/GroupOrderCreatedModal.tsx
import React from 'react';
import QRCode from 'qrcode.react';

interface Props {
  code: string;
  onClose: () => void;
}

export const GroupOrderCreatedModal: React.FC<Props> = ({ code, onClose }) => {
  const link = `${window.location.origin}/group-order/${code}`;
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Скопировано!');
  };
  
  const shareOrder = async () => {
    const shareData = {
      title: 'Присоединяйся к совместному заказу!',
      text: `Присоединяйся к совместному заказу!\n\nКод: ${code}`,
      url: link
    };
    
    try {
      // Проверяем поддержку Web Share API
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: копируем ссылку
        copyToClipboard(link);
        alert('Ссылка скопирована! Отправьте её соседям.');
      }
    } catch (err) {
      // Пользователь отменил или ошибка
      console.log('Ошибка при попытке поделиться:', err);
    }
  };
  
  const shareWhatsApp = () => {
    const text = `Присоединяйся к совместному заказу!\n\nКод: ${code}\nСсылка: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };
  
  const shareTelegram = () => {
    const text = `Присоединяйся к совместному заказу!\n\nКод: ${code}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`);
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <h2>✅ Совместный заказ создан!</h2>
        
        {/* Код */}
        <div style={{ margin: '20px 0' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>Ваш код для соседей:</p>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#ff6b35',
            padding: '15px',
            background: '#fff3e0',
            borderRadius: '12px',
            margin: '10px 0',
            letterSpacing: '2px'
          }}>
            🔑 {code}
          </div>
        </div>
        
        {/* QR-код */}
        <div style={{ margin: '30px 0' }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            Или покажите QR-код:
          </p>
          <div style={{
            display: 'inline-block',
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <QRCode 
              value={link}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
            Соседи могут отсканировать камерой телефона
          </p>
        </div>
        
        {/* Кнопки действий */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' }}>
          <button 
            className="btn btn-primary"
            onClick={() => copyToClipboard(code)}
            style={{ width: '100%' }}
          >
            📋 Скопировать код
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => copyToClipboard(link)}
            style={{ width: '100%' }}
          >
            🔗 Скопировать ссылку
          </button>
          
          <button 
            className="btn"
            onClick={shareOrder}
            style={{ 
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none'
            }}
          >
            🚀 Поделиться
          </button>
        </div>
        
        {/* Инструкция */}
        <div style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#666',
          textAlign: 'left',
          margin: '20px 0'
        }}>
          <strong>Как пригласить соседей:</strong>
          <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Отправьте код или ссылку в чат</li>
            <li>Или покажите QR-код на экране</li>
            <li>Соседи присоединятся и добавят свои товары</li>
            <li>Все оплачивают товары до закрытия пула</li>
          </ol>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={onClose}
          style={{ width: '100%' }}
        >
          Перейти к заказу
        </button>
      </div>
    </div>
  );
};
```

---

### 3. Кнопка "Присоединиться" в Header

```tsx
// src/components/Header.tsx
import React, { useState } from 'react';

export const Header: React.FC = () => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  
  const handleJoinOrder = () => {
    // Проверяем код
    const groupOrder = groupOrders.find(go => go.code === codeInput);
    
    if (groupOrder) {
      navigate(`/group-order/${codeInput}`);
      setShowJoinModal(false);
    } else {
      alert('Заказ с таким кодом не найден');
    }
  };
  
  const validateCode = (code: string) => {
    if (code.length === 0) {
      setCodeValid(null);
      return;
    }
    
    const exists = groupOrders.some(go => go.code === code);
    setCodeValid(exists);
  };
  
  return (
    <header>
      {/* ... другие элементы ... */}
      
      <button 
        className="btn btn-secondary"
        onClick={() => setShowJoinModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        👥 Присоединиться к заказу
      </button>
      
      {/* Модальное окно */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Присоединиться к совместному заказу</h3>
            
            <div style={{ margin: '20px 0' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                Введите код от организатора:
              </label>
              
              <input
                type="text"
                className="input"
                placeholder="SOSEDI-A7K9"
                value={codeInput}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setCodeInput(value);
                  validateCode(value);
                }}
                style={{
                  width: '100%',
                  fontSize: '18px',
                  letterSpacing: '2px',
                  textAlign: 'center',
                  borderColor: codeValid === null ? '#ddd' : (codeValid ? 'green' : 'red')
                }}
              />
              
              {codeValid !== null && (
                <p style={{
                  marginTop: '8px',
                  fontSize: '14px',
                  color: codeValid ? 'green' : 'red'
                }}>
                  {codeValid ? '✅ Заказ найден' : '❌ Заказ не найден'}
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={handleJoinOrder}
                disabled={!codeValid}
                style={{ flex: 1 }}
              >
                Найти заказ
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={() => setShowJoinModal(false)}
                style={{ flex: 1 }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
```

---

### 4. Страница совместного заказа с QR-кодом

```tsx
// src/pages/GroupOrderPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode.react';

export const GroupOrderPage: React.FC = () => {
  const { code } = useParams();
  const [showQR, setShowQR] = useState(false);
  
  const link = `${window.location.origin}/group-order/${code}`;
  
  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>👥 Совместный заказ {code}</h2>
          
          <button
            className="btn btn-secondary"
            onClick={() => setShowQR(!showQR)}
          >
            {showQR ? '❌ Скрыть QR' : '📱 Показать QR'}
          </button>
        </div>
        
        {/* QR-код для приглашения */}
        {showQR && (
          <div style={{
            margin: '20px 0',
            padding: '20px',
            background: '#f9f9f9',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <p style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
              Покажите этот QR-код соседям для быстрого присоединения:
            </p>
            
            <div style={{
              display: 'inline-block',
              padding: '20px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <QRCode 
                value={link}
                size={250}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <p style={{ marginTop: '15px', fontSize: '12px', color: '#999' }}>
              Или отправьте код: <strong style={{ color: '#ff6b35' }}>{code}</strong>
            </p>
          </div>
        )}
        
        {/* Остальной контент страницы */}
        {/* ... участники, товары и т.д. ... */}
      </div>
    </div>
  );
};
```

---

## 📊 ИТОГОВАЯ СХЕМА ПРИСОЕДИНЕНИЯ

```
Организатор создает заказ
         ↓
Получает код: SOSEDI-A7K9
         ↓
    ┌────┴────┬────────┬────────┐
    ↓         ↓        ↓        ↓
  Код     Ссылка    QR-код   Кнопка
    ↓         ↓        ↓        ↓
Сосед вводит | Переходит | Сканирует | Нажимает
в модалке    | по ссылке | камерой   | в Header
    ↓         ↓        ↓        ↓
    └─────────┴────────┴────────┘
              ↓
    /group-order/SOSEDI-A7K9
              ↓
    Страница заказа
```

---

## 🎯 ПРЕИМУЩЕСТВА КАЖДОГО СПОСОБА

### 1. Ввод кода вручную
- ✅ Работает везде
- ✅ Можно продиктовать по телефону
- ✅ Легко запомнить короткий код
- ❌ Нужно вводить вручную

### 2. Прямая ссылка
- ✅ Один клик
- ✅ Работает в мессенджерах
- ✅ Можно отправить в чат
- ❌ Длинная ссылка

### 3. QR-код
- ✅ Мгновенное сканирование
- ✅ Не нужно ничего вводить
- ✅ Идеально для личной встречи
- ❌ Нужна камера телефона

---

## 💡 ДОПОЛНИТЕЛЬНЫЕ ФИЧИ

### Автоопределение кода из буфера обмена

```tsx
useEffect(() => {
  if (showJoinModal) {
    navigator.clipboard.readText().then(text => {
      // Проверяем формат SOSEDI-XXXX
      if (/^SOSEDI-[A-Z0-9]{4}$/.test(text.trim())) {
        setCodeInput(text.trim());
        validateCode(text.trim());
      }
    }).catch(() => {
      // Игнорируем ошибки доступа к буферу
    });
  }
}, [showJoinModal]);
```

### Сохранение QR-кода как изображение

```tsx
const downloadQR = () => {
  const canvas = document.querySelector('canvas');
  if (canvas) {
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `group-order-${code}.png`;
    link.href = url;
    link.click();
  }
};

<button onClick={downloadQR}>
  💾 Сохранить QR-код
</button>
```

---

Все три способа работают параллельно и приводят к одному результату! 🎉
