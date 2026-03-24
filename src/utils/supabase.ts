import { createClient } from '@supabase/supabase-js';

// Ваш собственный Supabase сервер
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || (typeof window !== 'undefined' ? window.location.origin + '/supabase' : 'http://100.127.227.15:8000');
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLWRlbW8iLCJpYXQiOjE2NDE3NjkyMDAsImV4cCI6MTc5OTUzNTYwMH0.F_rDxRTPE8OU83L_CNgEGXfmirMXmMMugT29Cvc8ygQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Функция для загрузки файлов (изображения + PDF)
export const uploadImage = async (file: File, bucket: string = 'product-images'): Promise<string | null> => {
  try {
    console.log('📄 Начинаем загрузку файла:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    console.log('💾 Загружаем в Supabase:', fileName);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Ошибка загрузки в Supabase:', error);
      throw new Error(`Ошибка загрузки: ${error.message}`);
    }

    console.log('✅ Файл загружен в Supabase:', data);

    // Получаем публичный URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('🔗 Получен публичный URL:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ Общая ошибка загрузки:', error);
    throw error;
  }
};

// Функция для удаления изображения
export const deleteImage = async (url: string, bucket: string = 'product-images'): Promise<boolean> => {
  try {
    const fileName = url.split('/').pop();
    if (!fileName) return false;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    return !error;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};