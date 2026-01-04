const admin = require('firebase-admin');

// Инициализация с ключом проекта
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'kalaktika-app'
});

const db = admin.firestore();

async function removeDuplicates() {
  console.log('🧹 Удаляем дубликаты товаров...');
  
  try {
    const snapshot = await db.collection('products').get();
    const products = [];
    
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Найдено ${products.length} товаров`);
    
    // Группируем по названию
    const groups = {};
    products.forEach(product => {
      const name = product.name.trim().toLowerCase();
      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push(product);
    });
    
    // Удаляем дубликаты батчами
    let deleteCount = 0;
    
    for (const group of Object.values(groups)) {
      if (group.length > 1) {
        console.log(`Найдены дубликаты: ${group[0].name} (${group.length} шт)`);
        
        // Удаляем все кроме первого
        for (let i = 1; i < group.length; i++) {
          try {
            await db.collection('products').doc(group[i].id).delete();
            console.log(`✅ Удален: ${group[i].name} (ID: ${group[i].id})`);
            deleteCount++;
          } catch (error) {
            console.log(`❌ Ошибка удаления ${group[i].name}: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`📊 Результат:`);
    console.log(`   Было товаров: ${products.length}`);
    console.log(`   Удалено дубликатов: ${deleteCount}`);
    console.log(`   Осталось: ${products.length - deleteCount}`);
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

removeDuplicates();