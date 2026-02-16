import { useState, useEffect, useCallback } from 'react';

// Debounce хук
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Хук для подсказок адресов с debounce
export function useAddressSuggestions() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://suggest-maps.yandex.ru/v1/suggest?` +
          `apikey=41a4deeb-0548-4d8e-b897-3c4a6bc08032&` +
          `text=${encodeURIComponent('Новосибирск ' + debouncedQuery)}&` +
          `results=5&` +
          `type=house`
        );
        
        if (response.ok) {
          const data = await response.json();
          const results = data.results?.map((item: any) => {
            const title = item.title?.text || item.text || '';
            const subtitle = item.subtitle?.text || '';
            return subtitle ? `${title}, ${subtitle}` : title;
          }) || [];
          setSuggestions(results.slice(0, 5));
        }
      } catch (error) {
        console.error('Ошибка получения подсказок:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  return { query, setQuery, suggestions, loading };
}
