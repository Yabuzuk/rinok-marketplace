// Утилита для оптимизации изображений
export const optimizeImage = async (
  file: File, 
  maxWidth: number = 800, 
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Вычисляем новые размеры с сохранением пропорций
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Рисуем сжатое изображение
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Конвертируем в WebP (если поддерживается) или JPEG
      const outputFormat = canvas.toDataURL('image/webp').startsWith('data:image/webp') 
        ? 'image/webp' 
        : 'image/jpeg';
      
      canvas.toBlob((blob) => {
        if (blob) {
          const optimizedFile = new File([blob], file.name, {
            type: outputFormat,
            lastModified: Date.now()
          });
          resolve(optimizedFile);
        }
      }, outputFormat, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Конвертация существующих URL в WebP
export const convertToWebP = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      // Пытаемся конвертировать в WebP
      const webpDataUrl = canvas.toDataURL('image/webp', 0.8);
      
      // Если WebP поддерживается и размер меньше
      if (webpDataUrl.startsWith('data:image/webp') && webpDataUrl.length < imageUrl.length) {
        resolve(webpDataUrl);
      } else {
        resolve(imageUrl); // Возвращаем оригинал
      }
    };
    
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
};