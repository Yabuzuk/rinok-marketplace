const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { createClient } = require('@supabase/supabase-js');

// Firebase config (из вашего проекта)
const firebaseConfig = {
  apiKey: "AIzaSyADaZYOM7nOITKBlfn0jhtwtTBI7RbB_m8",
  authDomain: "kalaktika-app.firebaseapp.com",
  projectId: "kalaktika-app",
  storageBucket: "kalaktika-app.firebasestorage.app",
  messagingSenderId: "735114029908",
  appId: "1:735114029908:web:8155afa0b285ce8c06f6c1",
  measurementId: "G-T7JLSH3WQS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Supabase config
const supabaseUrl = 'http://31.130.133.18/supabase';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLWRlbW8iLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.F_rDxRTPE8OU83L_CNgEGXfmirMXmMMugT29Cvc8ygQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateProducts() {
  console.log('📦 Migrating products...');
  
  const snapshot = await getDocs(collection(db, 'products'));
  const products = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    products.push({
      id: doc.id,
      name: data.name,
      price: data.price,
      category: data.category,
      description: data.description || '',
      stock: data.stock || 0,
      minorderquantity: data.minOrderQuantity || 1,
      image: data.image || '',
      sellerid: data.sellerId || null,
      pavilionnumber: data.pavilionNumber || null,
      internalcode: data.internalCode || null,
      createdat: data.createdAt || new Date().toISOString()
    });
  });
  
  console.log(`Found ${products.length} products`);
  
  if (products.length > 0) {
    const { data, error } = await supabase
      .from('products')
      .insert(products);
    
    if (error) {
      console.error('Error inserting products:', error);
    } else {
      console.log('✅ Products migrated successfully');
    }
  }
}

async function migrateOrders() {
  console.log('📦 Migrating orders...');
  
  const snapshot = await getDocs(collection(db, 'orders'));
  const orders = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    orders.push({
      id: doc.id,
      customerid: data.userId || data.customerId,
      items: JSON.stringify(data.items),
      total: data.total,
      status: data.status,
      deliveryaddress: data.deliveryAddress || '',
      deliverydate: data.deliveryDate || null,
      deliverytimeslot: data.deliveryTimeSlot || null,
      deliverytype: data.deliveryType || null,
      deliveryprice: data.deliveryPrice || null,
      pavilionnumber: data.pavilionNumber || null,
      grouporderid: data.groupOrderId || null,
      courierid: data.courierId || null,
      ismodified: data.isModified || false,
      customerapproved: data.customerApproved || false,
      createdat: data.createdAt || new Date().toISOString()
    });
  });
  
  console.log(`Found ${orders.length} orders`);
  
  if (orders.length > 0) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orders);
    
    if (error) {
      console.error('Error inserting orders:', error);
    } else {
      console.log('✅ Orders migrated successfully');
    }
  }
}

async function migrateUsers() {
  console.log('📦 Migrating users...');
  
  const snapshot = await getDocs(collection(db, 'users'));
  const users = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    
    // Пропускаем пользователей без email
    if (!data.email) {
      console.log(`Skipping user ${doc.id} - no email`);
      return;
    }
    
    // Конвертируем Firestore Timestamp в ISO string
    let createdAt = new Date().toISOString();
    if (data.createdAt) {
      if (data.createdAt.toDate) {
        createdAt = data.createdAt.toDate().toISOString();
      } else if (data.createdAt.seconds) {
        createdAt = new Date(data.createdAt.seconds * 1000).toISOString();
      } else if (typeof data.createdAt === 'string') {
        createdAt = data.createdAt;
      }
    }
    
    users.push({
      id: doc.id,
      email: data.email,
      name: data.name || 'User',
      role: data.role || 'customer',
      pavilionnumber: data.pavilionNumber || null,
      blocked: data.blocked || false,
      addresses: JSON.stringify(data.addresses || []),
      createdat: createdAt
    });
  });
  
  console.log(`Found ${users.length} users`);
  
  if (users.length > 0) {
    const { data, error } = await supabase
      .from('users')
      .insert(users);
    
    if (error) {
      console.error('Error inserting users:', error);
    } else {
      console.log('✅ Users migrated successfully');
    }
  }
}

async function main() {
  try {
    await migrateProducts();
    await migrateOrders();
    await migrateUsers();
    console.log('🎉 Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
