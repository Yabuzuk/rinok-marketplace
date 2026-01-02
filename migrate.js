import { supabaseApi } from './utils/supabaseApi';
import { firebaseApi } from './utils/firebaseApi';

const migrateData = async () => {
  console.log('🚀 Начинаем миграцию данных из Supabase в Firebase...');
  
  try {
    // 1. Миграция пользователей
    console.log('📥 Загружаем пользователей из Supabase...');
    const supabaseUsers = await supabaseApi.getUsers();
    console.log(`Найдено ${supabaseUsers.length} пользователей`);
    
    for (const user of supabaseUsers) {
      try {
        await firebaseApi.createUser(user);
        console.log(`✅ Пользователь ${user.name} (${user.role}) перенесен`);
      } catch (error) {
        console.log(`⚠️ Пользователь ${user.name} уже существует или ошибка:`, error);
      }
    }
    
    // 2. Миграция товаров
    console.log('📦 Загружаем товары из Supabase...');
    const supabaseProducts = await supabaseApi.getProducts();
    console.log(`Найдено ${supabaseProducts.length} товаров`);
    
    for (const product of supabaseProducts) {
      try {
        await firebaseApi.createProduct(product);
        console.log(`✅ Товар ${product.name} перенесен`);
      } catch (error) {
        console.log(`⚠️ Товар ${product.name} уже существует или ошибка:`, error);
      }
    }
    
    // 3. Миграция заказов
    console.log('📋 Загружаем заказы из Supabase...');
    const supabaseOrders = await supabaseApi.getOrders();
    console.log(`Найдено ${supabaseOrders.length} заказов`);
    
    for (const order of supabaseOrders) {
      try {
        await firebaseApi.createOrder(order);
        console.log(`✅ Заказ ${order.id} перенесен`);
      } catch (error) {
        console.log(`⚠️ Заказ ${order.id} уже существует или ошибка:`, error);
      }
    }
    
    console.log('🎉 Миграция завершена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
  }
};

// Запуск миграции
migrateData();