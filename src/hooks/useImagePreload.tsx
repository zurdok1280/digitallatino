import { useState, useEffect } from 'react';

interface UseImagePreloadOptions {
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}

export const useImagePreload = (src: string, options: UseImagePreloadOptions = {}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    const handleLoad = () => setLoaded(true);
    const handleError = () => setError(true);

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    // Prioridad alta carga inmediatamente
    if (options.priority) {
      img.src = src;
    } else {
      // Lazy loading con Intersection Observer
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            img.src = src;
            observer.disconnect();
          }
        },
        { rootMargin: '50px' }
      );

      // Si no hay elemento específico para observar, cargar inmediatamente
      const tempDiv = document.createElement('div');
      observer.observe(tempDiv);
      
      return () => {
        observer.disconnect();
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      };
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src, options.priority]);

  return { loaded, error };
};

// Hook para precargar múltiples imágenes
export const useMultipleImagePreload = (images: string[]) => {
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount] = useState(images.length);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (images.length === 0) {
      setLoading(false);
      return;
    }

    let completed = 0;

    const promises = images.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = img.onerror = () => {
          completed += 1;
          setLoadedCount(completed);
          resolve();
        };
        img.src = src;
      });
    });

    Promise.all(promises).then(() => {
      setLoading(false);
    });
  }, [images]);

  return {
    loadedCount,
    totalCount,
    loading,
    progress: totalCount > 0 ? loadedCount / totalCount : 0,
  };
};