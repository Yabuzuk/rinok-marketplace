-- Добавляем колонку selleractive в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS selleractive BOOLEAN DEFAULT true;

-- Устанавливаем значение true для всех существующих продавцов
UPDATE users SET selleractive = true WHERE role = 'seller';

-- Проверяем результат
SELECT id, name, email, role, selleractive FROM users WHERE role = 'seller';
