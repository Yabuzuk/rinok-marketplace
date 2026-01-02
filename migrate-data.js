const { supabaseApi } = require('./src/utils/supabaseApi');
const { firebaseApi } = require('./src/utils/firebaseApi');

const migrateData = async () => {
  console.log('🚀 Начинаем миграцию данных из Supabase в Firebase...');
  
  try {
    // 1. Миграция пользователей
    console.log('📥 Загружаем пользователей из Supabase...');
    const supabaseUsers = await supabaseApi.getUsers();
    console.log(`Найдено ${supabaseUsers.length} пользователей`);
    
    let migratedUsers = 0;
    for (const user of supabaseUsers) {
      try {
        await firebaseApi.createUser(user);
        console.log(`✅ Пользователь ${user.name} (${user.role}) перенесен`);
        migratedUsers++;
      } catch (error) {
        if (error?.code === 'already-exists') {
          console.log(`⚠️ Пользователь ${user.name} уже существует`);
        } else {
          console.log(`❌ Ошибка переноса пользователя ${user.name}:`, error?.message);
        }
      }
    }
    
    // 2. Миграция товаров
    console.log('📦 Загружаем товары из Supabase...');
    const supabaseProducts = await supabaseApi.getProducts();
    console.log(`Найдено ${supabaseProducts.length} товаров`);
    
    let migratedProducts = 0;
    for (const product of supabaseProducts) {
      try {
        await firebaseApi.createProduct(product);
        console.log(`✅ Товар ${product.name} (павильон ${product.pavilionNumber}) перенесен`);
        migratedProducts++;
      } catch (error) {
        if (error?.code === 'already-exists') {
          console.log(`⚠️ Товар ${product.name} уже существует`);
        } else {
          console.log(`❌ Ошибка переноса товара ${product.name}:`, error?.message);
        }
      }
    }
    
    // 3. Миграция заказов
    console.log('📋 Загружаем заказы из Supabase...');
    const supabaseOrders = await supabaseApi.getOrders();
    console.log(`Найдено ${supabaseOrders.length} заказов`);
    
    let migratedOrders = 0;
    for (const order of supabaseOrders) {
      try {
        await firebaseApi.createOrder(order);
        console.log(`✅ Заказ ${order.id} на сумму ${order.total}₽ перенесен`);
        migratedOrders++;
      } catch (error) {
        if (error?.code === 'already-exists') {
          console.log(`⚠️ Заказ ${order.id} уже существует`);
        } else {
          console.log(`❌ Ошибка переноса заказа ${order.id}:`, error?.message);
        }
      }
    }
    
    console.log('\n🎉 Миграция завершена!');
    console.log(`📊 Статистика:`);
    console.log(`   Пользователи: ${migratedUsers}/${supabaseUsers.length}`);
    console.log(`   Товары: ${migratedProducts}/${supabaseProducts.length}`);
    console.log(`   Заказы: ${migratedOrders}/${supabaseOrders.length}`);
    
  } catch (error) {
    console.error('❌ Критическая ошибка миграции:', error);
  }
};

// Запуск миграции
migrateData().then(() => {
  console.log('Миграция завершена. Можно закрыть скрипт.');
}).catch((error) => {
  console.error('Ошибка запуска миграции:', error);
});