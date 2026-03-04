import React from 'react';
import { DeliveryType, DeliveryDate, DELIVERY_TIME_SLOTS, getAvailableDeliveryDates, isTimeSlotAvailable } from '../types';

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

  const handleNowClick = () => {
    onDeliveryTypeChange('individual');
    onDateChange(availableDates[0].value);
    onTimeSlotChange('now');
  };

  const handleTimeSlotClick = (slot: string) => {
    onDeliveryTypeChange('auto_group');
    if (!selectedDate) {
      onDateChange(availableDates[0].value);
    }
    onTimeSlotChange(slot);
  };

  const handleDateChange = (dateValue: any) => {
    onDateChange(dateValue);
    if (selectedTimeSlot === 'now') {
      onTimeSlotChange(null as any);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        Когда доставить:
      </label>
      
      {/* Кнопка Сейчас */}
      <button
        onClick={handleNowClick}
        style={{
          width: '100%',
          padding: '10px',
          border: selectedTimeSlot === 'now' && selectedDate === availableDates[0].value ? '2px solid #ff6b35' : '1px solid #ddd',
          borderRadius: '8px',
          background: selectedTimeSlot === 'now' && selectedDate === availableDates[0].value ? '#fff3e0' : 'white',
          cursor: 'pointer',
          fontSize: '13px',
          marginBottom: '10px'
        }}
      >
        ⚡ Сейчас
      </button>
      
      {/* Выбор даты */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        {availableDates.slice(0, 2).map(date => (
          <button
            key={date.value}
            onClick={() => handleDateChange(date.value)}
            style={{
              flex: 1,
              padding: '10px',
              border: selectedDate === date.value ? '2px solid #ff6b35' : '1px solid #ddd',
              borderRadius: '8px',
              background: selectedDate === date.value ? '#fff3e0' : 'white',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            {date.label}
          </button>
        ))}
      </div>
      
      {/* Слоты времени */}
      {selectedTimeSlot !== 'now' && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {DELIVERY_TIME_SLOTS.map(slot => {
            const available = isTimeSlotAvailable(selectedDateObj?.date || availableDates[0].date, slot.id);
            return (
              <button
                key={slot.id}
                onClick={() => available && handleTimeSlotClick(slot.id)}
                disabled={!available}
                style={{
                  flex: 1,
                  minWidth: '100px',
                  padding: '10px',
                  border: selectedTimeSlot === slot.id ? '2px solid #ff6b35' : '1px solid #ddd',
                  borderRadius: '8px',
                  background: !available ? '#f5f5f5' : (selectedTimeSlot === slot.id ? '#fff3e0' : 'white'),
                  cursor: available ? 'pointer' : 'not-allowed',
                  opacity: available ? 1 : 0.5,
                  fontSize: '13px'
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
      )}
    </div>
  );
};
