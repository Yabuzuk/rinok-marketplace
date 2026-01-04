const admin = require('firebase-admin');

// Инициализация Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": "kalaktika-app",
  "private_key_id": "your_private_key_id",
  "private_key": "your_private_key",
  "client_email": "your_client_email",
  "client_id": "your_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
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
    
    // Удаляем дубликаты
    const batch = db.batch();
    let deleteCount = 0;
    
    Object.values(groups).forEach(group => {
      if (group.length > 1) {
        // Оставляем первый, удаляем остальные
        for (let i = 1; i < group.length; i++) {
          batch.delete(db.collection('products').doc(group[i].id));
          deleteCount++;
          console.log(`Удаляем: ${group[i].name} (ID: ${group[i].id})`);
        }
      }
    });
    
    if (deleteCount > 0) {
      await batch.commit();
      console.log(`✅ Удалено ${deleteCount} дубликатов`);
      console.log(`📊 Осталось ${products.length - deleteCount} уникальных товаров`);
    } else {
      console.log('🎉 Дубликатов не найдено!');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

removeDuplicates();