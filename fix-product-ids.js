const { firebaseApi } = require('./src/utils/firebaseApi');

const fixProductIds = async () => {
  console.log('🔧 Начинаем исправление ID товаров...');
  
  try {
    // Получаем все товары из Firebase
    console.log('📦 Загружаем товары из Firebase...');
    const firebaseProducts = await firebaseApi.getProducts();
    console.log(`Найдено ${firebaseProducts.length} товаров в Firebase`);
    
    // Проверяем каждый товар
    const problematicProducts = [];
    const validProducts = [];
    
    for (const product of firebaseProducts) {
      try {
        // Пытаемся обновить товар, чтобы проверить существование
        await firebaseApi.updateProduct(product.id, { 
          name: product.name // Обновляем тем же значением
        });
        validProducts.push(product);
        console.log(`✅ Товар ${product.name} (ID: ${product.id}) - существует в Firebase`);
      } catch (error) {
        if (error.code === 'not-found') {
          problematicProducts.push(product);
          console.log(`❌ Товар ${product.name} (ID: ${product.id}) - НЕ существует в Firebase`);
        } else {
          console.log(`⚠️ Ошибка проверки товара ${product.name}:`, error.message);
        }
      }
    }
    
    console.log(`\n📊 Результат проверки:`);
    console.log(`   Валидные товары: ${validProducts.length}`);
    console.log(`   Проблемные товары: ${problematicProducts.length}`);
    
    // Восстанавливаем проблемные товары
    if (problematicProducts.length > 0) {
      console.log('\n🔄 Восстанавливаем проблемные товары...');
      
      for (const product of problematicProducts) {
        try {
          // Создаем товар заново (Firebase присвоит новый ID)
          const { id, ...productData } = product; // Убираем старый ID
          const newProduct = await firebaseApi.createProduct(productData);
          console.log(`✅ Товар ${product.name} восстановлен с новым ID: ${newProduct.id}`);
        } catch (error) {
          console.log(`❌ Ошибка восстановления товара ${product.name}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 Исправление ID товаров завершено!');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
};

// Запуск исправления
fixProductIds().then(() => {
  console.log('Исправление завершено. Можно закрыть скрипт.');
}).catch((error) => {
  console.error('Ошибка запуска исправления:', error);
});