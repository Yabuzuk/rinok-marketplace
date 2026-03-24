import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const StorageTestPage: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Проверяем Supabase Storage...');
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error('❌ Ошибка:', error);
        setError(error.message);
      } else {
        console.log('✅ Найдено файлов:', data?.length);
        setFiles(data || []);
      }
    } catch (err: any) {
      console.error('❌ Общая ошибка:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Проверка Supabase Storage
      </h1>

      <button
        onClick={loadFiles}
        style={{
          padding: '10px 20px',
          background: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        🔄 Обновить список
      </button>

      {loading && <div>⏳ Загрузка...</div>}
      
      {error && (
        <div style={{
          padding: '15px',
          background: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#c62828'
        }}>
          <strong>Ошибка:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>
            Найдено файлов: {files.length}
          </h2>

          {files.length === 0 ? (
            <div style={{
              padding: '20px',
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '8px',
              color: '#856404'
            }}>
              ⚠️ В хранилище нет файлов. Возможно, они были удалены при остановке проекта.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {files.map((file) => {
                const url = getPublicUrl(file.name);
                return (
                  <div
                    key={file.name}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '10px',
                      background: 'white'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '150px',
                      background: '#f5f5f5',
                      borderRadius: '4px',
                      marginBottom: '10px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img
                        src={url}
                        alt={file.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerHTML = '<div style="color: red;">❌ Не загрузилось</div>';
                          }
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '12px', wordBreak: 'break-all', marginBottom: '5px' }}>
                      <strong>{file.name}</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      {(file.metadata?.size / 1024).toFixed(2)} KB
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '11px',
                        color: '#2196f3',
                        textDecoration: 'none',
                        display: 'block',
                        marginTop: '5px'
                      }}
                    >
                      🔗 Открыть
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StorageTestPage;
