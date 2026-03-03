import React from 'react';
import { DeliveryType, DeliveryDate, DELIVERY_TIME_SLOTS, getAvailableDeliveryDates, isTimeSlotAvailable } from '../types';
import { Tooltip } from './Tooltip';

interface DeliveryDateSelectorProps {
  selectedDate: DeliveryDate | null;
  selectedTimeSlot: string | null;
  selectedDeliveryType: DeliveryType;
  onDateChange: (date: DeliveryDate) => void;
  onTimeSlotChange: (slot: string) => void;
  onDeliveryTypeChange: (type: DeliveryType) => void;
}

export const DeliveryDateSelector: React.FC<DeliveryDateSelectorProps> = ({
  selectedDate,
  selectedTimeSlot,
  selectedDeliveryType,
  onDateChange,
  onTimeSlotChange,
  onDeliveryTypeChange
}) => {
  const availableDates = getAvailableDeliveryDates();
  const selectedDateObj = availableDates.find(d => d.value === selectedDate);

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Тип доставки */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 'bold' }}>
          Тип доставки:
          <Tooltip text="Выберите способ доставки вашего заказа" />
        </label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onDeliveryTypeChange('individual')}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '12px',
              border: selectedDeliveryType === 'individual' ? '2px solid #ff6b35' : '1px solid #ddd',
              borderRadius: '8px',
              background: selectedDeliveryType === 'individual' ? '#fff3e0' : 'white',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ fontSize: '16px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👤 Индивидуальная
              <Tooltip text="Доставка только для вас. Полная стоимость доставки" />
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Доставка только вам</div>
          </button>
          
          <button
            onClick={() => onDeliveryTypeChange('auto_group')}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '12px',
              border: selectedDeliveryType === 'auto_group' ? '2px solid #ff6b35' : '1px solid #ddd',
              borderRadius: '8px',
              background: selectedDeliveryType === 'auto_group' ? '#fff3e0' : 'white',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ fontSize: '16px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔄 Групповая
              <Tooltip text="Доставка делится между заказами в пуле. Экономия до 70%!" />
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Экономия на доставке</div>
          </button>
          
          <button
            onClick={() => onDeliveryTypeChange('neighbor_group')}
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '12px',
              border: selectedDeliveryType === 'neighbor_group' ? '2px solid #ff6b35' : '1px solid #ddd',
              borderRadius: '8px',
              background: selectedDeliveryType === 'neighbor_group' ? '#fff3e0' : 'white',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ fontSize: '16px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👥 По-соседски
              <Tooltip text="Создайте заказ с соседями. Делите доставку на всех!" />
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Заказ с соседями</div>
          </button>
        </div>
      </div>

      {/* Дата доставки (только для групповой) */}
      {selectedDeliveryType !== 'individual' && (
        <>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Дата доставки:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {availableDates.map(date => (
                <button
                  key={date.value}
                  onClick={() => onDateChange(date.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: selectedDate === date.value ? '2px solid #ff6b35' : '1px solid #ddd',
                    borderRadius: '8px',
                    background: selectedDate === date.value ? '#fff3e0' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  {date.label}
                </button>
              ))}
            </div>
          </div>

          {/* Временной слот */}
          {selectedDate && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Время доставки:
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {DELIVERY_TIME_SLOTS.map(slot => {
                  const available = isTimeSlotAvailable(selectedDateObj?.date || '', slot.id);
                  return (
                    <button
                      key={slot.id}
                      onClick={() => available && onTimeSlotChange(slot.id)}
                      disabled={!available}
                      style={{
                        flex: 1,
                        minWidth: '100px',
                        padding: '10px',
                        border: selectedTimeSlot === slot.id ? '2px solid #ff6b35' : '1px solid #ddd',
                        borderRadius: '8px',
                        background: !available ? '#f5f5f5' : (selectedTimeSlot === slot.id ? '#fff3e0' : 'white'),
                        cursor: available ? 'pointer' : 'not-allowed',
                        opacity: available ? 1 : 0.5
                      }}
                    >
                      <div>{slot.label}</div>
                      {!available && (
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '3px' }}>
                          Недоступно
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
