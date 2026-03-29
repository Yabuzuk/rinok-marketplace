-- Добавление колонок для платежных реквизитов в таблицу users

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "bankcardholderName" TEXT,
ADD COLUMN IF NOT EXISTS bankcard TEXT,
ADD COLUMN IF NOT EXISTS cardphone TEXT,
ADD COLUMN IF NOT EXISTS bankname TEXT;
