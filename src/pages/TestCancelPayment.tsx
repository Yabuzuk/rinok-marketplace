import React, { useState, useEffect } from 'react';
import { cancelPayment, checkPaymentStatus } from '../utils/tinkoff';

const TestCancelPayment: React.FC = () => {
  const [paymentId, setPaymentId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Загружаем последний PaymentId из localStorage
    const lastPaymentId = localStorage.getItem('lastPaymentId');
    const lastOrderId = localStorage.getItem('lastOrderId');
    if (lastPaymentId) setPaymentId(lastPaymentId);
    if (lastOrderId) setOrderId(lastOrderId);
  }, []);

  const handleCancel = async () => {
    if (!paymentId) {
      alert('Введите PaymentId');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Сначала проверяем статус платежа
      const status = await checkPaymentStatus(paymentId);
      console.log('Payment status before cancel:', status);
      
      if (status.Status !== 'CONFIRMED') {
        alert(`⚠️ Платеж ещё не подтверждён. Текущий статус: ${status.Status}. Дождитесь статуса CONFIRMED и попробуйте снова.`);
        setResult({ status: status.Status, message: 'Платеж не подтверждён' });
        setLoading(false);
        return;
      }
      
      // Отменяем платеж
      const response = await cancelPayment(paymentId);
      setResult(response);
      alert('✅ Платеж успешно отменен!');
    } catch (error: any) {
      setResult({ error: error.message });
      alert('❌ Ошибка отмены: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
        🧪 Тест отмены платежа (Тинькофф тест #8)
      </h1>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Инструкция:
        </h2>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Создайте заказ на главной странице</li>
          <li>Оплатите картой <code>5000 0000 0000 0108</code></li>
          <li><strong>ВАЖНО: Дождитесь возврата на сайт после оплаты!</strong></li>
          <li>PaymentId подставится автоматически</li>
          <li>Нажмите "Отменить платеж"</li>
        </ol>
      </div>

      <div className="card">
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Order ID:
          </label>
          <input
            type="text"
            className="input"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Автоматически из localStorage"
            readOnly
            style={{ background: '#f5f5f5' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Payment ID:
          </label>
          <input
            type="text"
            className="input"
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
            placeholder="Введите PaymentId или он подставится автоматически"
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleCancel}
          disabled={loading || !paymentId}
          style={{
            width: '100%',
            backgroundColor: loading ? '#ccc' : '#f44336',
            cursor: loading || !paymentId ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Отменяем...' : '❌ Отменить платеж'}
        </button>

        {result && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: result.error ? '#ffebee' : '#e8f5e9',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '24px', background: '#fff3cd' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#856404' }}>
          ⚠️ Важно для теста #8:
        </h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#856404' }}>
          <li>Используйте только карту <code>5000 0000 0000 0108</code></li>
          <li>После отмены проверьте статус в личном кабинете Тинькофф</li>
          <li>Статус должен быть "Возвращен полностью"</li>
        </ul>
      </div>
    </div>
  );
};

export default TestCancelPayment;
