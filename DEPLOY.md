# Деплой Rinok

## Быстрый деплой на Vercel

1. Установите Vercel CLI:
```bash
npm i -g vercel
```

2. Войдите в аккаунт:
```bash
vercel login
```

3. Деплой:
```bash
vercel --prod
```

## Альтернативные варианты

### Netlify
```bash
npm run build
# Загрузите папку build на netlify.com
```

### GitHub Pages
```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d build
```

## Переменные окружения

Создайте `.env` файл:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
```