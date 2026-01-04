import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Product } from '../types';
import { uploadImage } from '../utils/supabase';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (productId: string, updates: Partial<Product>) => Promise<void>;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      setImagePreview(product.image);
      setSelectedImage(null);
      // Фокус на первое поле через небольшую задержку
      setTimeout(() => {
        const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
        nameInput?.focus();
      }, 100);
    }
  }, [product, isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      let imageUrl = formData.get('imageUrl') as string || product.image;
      
      if (selectedImage) {
        const supabaseUrl = await uploadImage(selectedImage);
        if (supabaseUrl) {
          imageUrl = supabaseUrl;
        } else {
          alert('Ошибка загрузки изображения');
          return;
        }
      }
      
      const updates = {
        name: formData.get('name') as string,
        price: Number(formData.get('price')),
        image: imageUrl,
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        stock: Number(formData.get('stock')),
        minOrderQuantity: Number(formData.get('minOrderQuantity')),
        sellerId: product.sellerId,
        pavilionNumber: product.pavilionNumber
      };

      await onUpdate(product.id, updates);
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении товара:', error);
      onClose();
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <div style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          borderBottom: '1px solid #e0e0e0',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '12px 12px 0 0'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
            Редактировать товар
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="grid grid-2" style={{ marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Название
              </label>
              <input name="name" className="input" defaultValue={product.name} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Цена (₽)
              </label>
              <input name="price" type="number" className="input" defaultValue={product.price} required />
            </div>
          </div>
          
          <div className="grid grid-2" style={{ marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Категория
              </label>
              <select name="category" className="input" defaultValue={product.category} required>
                <option value="fruits">Фрукты</option>
                <option value="vegetables">Овощи</option>
                <option value="greens">Зелень</option>
                <option value="berries">Ягоды</option>
                <option value="nuts">Орехи</option>
                <option value="spices">Специи</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Количество
              </label>
              <input name="stock" type="number" className="input" defaultValue={product.stock} required />
            </div>
          </div>
          
          <div className="grid grid-2" style={{ marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Мин. количество для заказа
              </label>
              <input name="minOrderQuantity" type="number" min="1" className="input" defaultValue={product.minOrderQuantity} required />
            </div>
            <div></div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Изображение товара
            </label>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    background: '#f9f5f0',
                    border: '2px dashed #d4c4b0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#8b4513'
                  }}>
                    <Upload size={16} />
                    Загрузить новый файл
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>или</div>
                
                <input 
                  name="imageUrl" 
                  type="url" 
                  className="input" 
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              {imagePreview && (
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #d4c4b0'
                }}>
                  <img 
                    src={imagePreview} 
                    alt="Предпросмотр"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              Описание
            </label>
            <textarea 
              name="description" 
              className="input" 
              rows={3}
              style={{ resize: 'vertical' }}
              defaultValue={product.description}
              required 
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Отмена
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Обновление...' : 'Обновить товар'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;