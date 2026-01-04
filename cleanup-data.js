const { firebaseApi } = require('./src/utils/firebaseApi');

const cleanupData = async () => {
  console.log('🧹 Начинаем очистку и синхронизацию данных Firebase...');
  
  try {
    // Получаем все товары из Firebase
    console.log('📦 Загружаем товары из Firebase...');
    const firebaseProducts = await firebaseApi.getProducts();
    console.log(`Найдено ${firebaseProducts.length} товаров в Firebase`);
    
    // Проверяем каждый товар на валидность
    let validProducts = 0;
    let invalidProducts = 0;
    
    for (const product of firebaseProducts) {
      if (product.id && product.name && product.price && product.pavilionNumber) {
        validProducts++;
        console.log(`✅ Товар ${product.name} (ID: ${product.id}) - валидный`);
      } else {
        invalidProducts++;
        console.log(`❌ Товар ${product.name || 'Без названия'} (ID: ${product.id}) - невалидный`);
        console.log(`   Отсутствуют поля:`, {
          name: !product.name,
          price: !product.price,
          pavilionNumber: !product.pavilionNumber
        });
      }
    }
    
    console.log('\n📊 Статистика товаров:');
    console.log(`   Валидные: ${validProducts}`);
    console.log(`   Невалидные: ${invalidProducts}`);
    
    // Получаем все заказы
    console.log('\n📋 Загружаем заказы из Firebase...');
    const firebaseOrders = await firebaseApi.getOrders();
    console.log(`Найдено ${firebaseOrders.length} заказов в Firebase`);
    
    // Получаем всех пользователей
    console.log('\n👥 Загружаем пользователей из Firebase...');
    const firebaseUsers = await firebaseApi.getUsers();
    console.log(`Найдено ${firebaseUsers.length} пользователей в Firebase`);
    
    // Группируем пользователей по ролям
    const usersByRole = firebaseUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('👥 Пользователи по ролям:', usersByRole);
    
    console.log('\n🎉 Анализ данных завершен!');
    
  } catch (error) {
    console.error('❌ Ошибка анализа данных:', error);
  }
};

// Запуск анализа
cleanupData().then(() => {
  console.log('Анализ завершен. Можно закрыть скрипт.');
}).catch((error) => {
  console.error('Ошибка запуска анализа:', error);
});