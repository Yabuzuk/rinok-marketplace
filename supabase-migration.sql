-- Миграция базы данных для проекта Rinok

-- Создание таблицы products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT,
  category TEXT NOT NULL,
  description TEXT,
  stock NUMERIC NOT NULL DEFAULT 0,
  minOrderQuantity NUMERIC NOT NULL DEFAULT 1,
  sellerId TEXT,
  pavilionNumber TEXT,
  internalCode TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Создание таблицы users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  pavilionNumber TEXT,
  blocked BOOLEAN DEFAULT FALSE,
  addresses JSONB DEFAULT '[]'::jsonb,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Создание таблицы orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customerId TEXT,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL,
  deliveryAddress TEXT,
  deliveryDate TEXT,
  deliveryTimeSlot TEXT,
  deliveryType TEXT,
  deliveryPrice NUMERIC,
  pavilionNumber TEXT,
  groupOrderId TEXT,
  courierId TEXT,
  isModified BOOLEAN DEFAULT FALSE,
  customerApproved BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Создание таблицы group_orders
CREATE TABLE IF NOT EXISTS group_orders (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  deliveryDate TEXT NOT NULL,
  deliveryTimeSlot TEXT NOT NULL,
  deliveryPoolId TEXT,
  poolCloseTime TEXT,
  organizerId TEXT NOT NULL,
  organizerName TEXT NOT NULL,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open',
  deliveryPrice NUMERIC,
  deliveryShares JSONB,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Создание таблицы delivery_pools
CREATE TABLE IF NOT EXISTS delivery_pools (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  timeSlot TEXT NOT NULL,
  closeTime TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  orders JSONB DEFAULT '[]'::jsonb,
  groupOrders JSONB DEFAULT '[]'::jsonb,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Создание таблицы analytics
CREATE TABLE IF NOT EXISTS analytics (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  visits INTEGER DEFAULT 0,
  uniqueVisitors INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_pavilion ON products(pavilionNumber);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customerId);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_group_orders_code ON group_orders(code);
CREATE INDEX IF NOT EXISTS idx_group_orders_status ON group_orders(status);

-- Включение Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Политики доступа (разрешаем всё для anon и authenticated)
CREATE POLICY "Allow all for products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for group_orders" ON group_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for delivery_pools" ON delivery_pools FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for analytics" ON analytics FOR ALL USING (true) WITH CHECK (true);

-- Создание Storage bucket для изображений
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Политика доступа к Storage
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'product-images');
