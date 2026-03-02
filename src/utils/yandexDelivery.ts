// Утилита для работы с API Яндекс Доставки

const YANDEX_DELIVERY_API = 'https://b2b.taxi.yandex.net/b2b/cargo/integration/v2';

// Кэш координат для оптимизации
const coordsCache = new Map<string, [number, number]>();

export const calculateDeliveryPrice = async (
  fromAddress: string,
  toAddress: string,
  token: string
): Promise<number> => {
  try {
    console.log('Calculating delivery from:', fromAddress, 'to:', toAddress);
    
    // Геокодирование адресов
    let fromCoords = coordsCache.get(fromAddress);
    let toCoords = coordsCache.get(toAddress);

    if (!fromCoords) {
      fromCoords = await geocodeAddress(fromAddress);
      coordsCache.set(fromAddress, fromCoords);
      console.log('From coordinates:', fromCoords);
    }
    
    if (!toCoords) {
      toCoords = await geocodeAddress(toAddress);
      coordsCache.set(toAddress, toCoords);
      console.log('To coordinates:', toCoords);
    }

    // Запрос к API Яндекс Доставки для расчета стоимости
    const requestBody = {
      items: [{
        quantity: 1,
        size: { length: 0.5, width: 0.5, height: 0.5 },
        weight: 20
      }],
      route_points: [
        {
          coordinates: fromCoords,
          fullname: fromAddress
        },
        {
          coordinates: toCoords,
          fullname: toAddress
        }
      ],
      requirements: {
        cargo_type: "lcv_l" // Грузовой тип доставки
      }
    };

    console.log('Request to Yandex API:', requestBody);

    const response = await fetch(`${YANDEX_DELIVERY_API}/offers/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'ru',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Yandex API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Yandex API error:', errorText);
      throw new Error(`Yandex Delivery API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Yandex API response:', data);
    
    // Берем первый доступный вариант доставки
    if (data.offers && data.offers.length > 0) {
      const price = Math.ceil(parseFloat(data.offers[0].price));
      console.log('Calculated delivery price:', price);
      return price;
    }
    
    throw new Error('No delivery offers available');
    
  } catch (error) {
    console.error('Error calculating delivery price:', error);
    // Возвращаем фиксированную стоимость при ошибке
    return 500;
  }
};

// Геокодирование через Яндекс Геокодер
const geocodeAddress = async (address: string): Promise<[number, number]> => {
  const apiKey = process.env.REACT_APP_YANDEX_GEOCODER_KEY || '41a4deeb-0548-4d8e-b897-3c4a6bc08032';
  
  const response = await fetch(
    `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${encodeURIComponent(address)}&format=json`
  );

  if (!response.ok) {
    throw new Error('Geocoding failed');
  }

  const data = await response.json();
  const pos = data.response.GeoObjectCollection.featureMember[0]?.GeoObject.Point.pos;
  
  if (!pos) {
    throw new Error('Address not found');
  }

  const [lon, lat] = pos.split(' ').map(Number);
  return [lon, lat];
};
