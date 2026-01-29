// Скрипт для конвертации существующих изображений в WebP
import { firebaseApi } from './firebaseApi';
import { convertToWebP } from './imageOptimizer';

export const convertExistingImages = async () => {
  try {
    console.log('🔄 Начинаем конвертацию изображений...');
    
    // Получаем все товары
    const products = await firebaseApi.getProducts();
    let convertedCount = 0;
    let totalCount = 0;
    
    for (const product of products) {
      if (product.image && product.image.startsWith('http')) {
        totalCount++;
        console.log(`📸 Конвертируем: ${product.name}`);
        
        try {
          // Конвертируем изображение
          const webpImage = await convertToWebP(product.image);
          
          // Если изображение было оптимизировано
          if (webpImage !== product.image) {
            // Обновляем товар с новым изображением
            await firebaseApi.updateProduct(product.id, { image: webpImage });
            convertedCount++;
            console.log(`✅ Конвертировано: ${product.name}`);
          } else {
            console.log(`⏭️ Пропущено: ${product.name} (не удалось оптимизировать)`);
          }
        } catch (error) {
          console.error(`❌ Ошибка конвертации ${product.name}:`, error);
        }
        
        // Небольшая задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`🎉 Конвертация завершена! Обработано: ${convertedCount}/${totalCount} изображений`);
    return { convertedCount, totalCount };
    
  } catch (error) {
    console.error('❌ Ошибка массовой конвертации:', error);
    throw error;
  }
};

// Функция для запуска из консоли браузера
if (typeof window !== 'undefined') {
  (window as any).convertImages = convertExistingImages;
  console.log('✅ Функция convertImages() доступна в консоли');
}