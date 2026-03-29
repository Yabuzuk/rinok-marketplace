const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://100.127.227.15:8000';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLWRlbW8iLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.F_rDxRTPE8OU83L_CNgEGXfmirMXmMMugT29Cvc8ygQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function activateAllSellers() {
  try {
    console.log('🔍 Получаем всех продавцов...');
    
    // Получаем всех пользователей с ролью seller
    const { data: sellers, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'seller');
    
    if (selectError) {
      console.error('❌ Ошибка получения продавцов:', selectError);
      return;
    }
    
    console.log(`📊 Найдено продавцов: ${sellers.length}`);
    
    // Обновляем каждого продавца
    for (const seller of sellers) {
      console.log(`\n👤 Активируем продавца: ${seller.name} (${seller.email})`);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ selleractive: true })
        .eq('id', seller.id);
      
      if (updateError) {
        console.error(`❌ Ошибка обновления ${seller.name}:`, updateError);
      } else {
        console.log(`✅ ${seller.name} активирован`);
      }
    }
    
    console.log('\n✅ Все продавцы активированы!');
    
  } catch (error) {
    console.error('❌ Общая ошибка:', error);
  }
}

activateAllSellers();
