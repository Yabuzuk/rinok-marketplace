import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://ezaabcngjalnnweoqyhv.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YWFiY25namFsbm53ZW9xeWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MDMxNjcsImV4cCI6MjA3NDA3OTE2N30.0quRHqWl9qe5HQ90Q9J72LBVAMuUWywRCVOiIAc3YWM';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Функция для загрузки изображения
export const uploadImage = async (file: File, bucket: string = 'product-images'): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Получаем публичный URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
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