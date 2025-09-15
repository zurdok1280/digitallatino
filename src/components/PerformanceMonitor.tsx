import { useEffect } from 'react';

// Monitor de rendimiento simplificado
export const PerformanceMonitor = () => {
  useEffect(() => {
    // Solo en producción
    if (import.meta.env.DEV) return;

    // Web Vitals monitoring básico
    const observePerformance = () => {
      // First Contentful Paint (FCP)
      try {
        const observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              console.log(`FCP: ${entry.startTime}ms`);
            }
          });
        });
        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('Performance Observer not supported');
      }

      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log(`LCP: ${lastEntry.startTime}ms`);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP Observer not supported');
      }

      // Cumulative Layout Shift (CLS) básico
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (entry.hadRecentInput !== undefined && !entry.hadRecentInput) {
              clsValue += entry.value || 0;
              console.log(`CLS: ${clsValue}`);
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS Observer not supported');
      }
    };

    // Ejecutar cuando la página esté completamente cargada
    if (document.readyState === 'complete') {
      observePerformance();
    } else {
      window.addEventListener('load', observePerformance);
    }

    return () => {
      window.removeEventListener('load', observePerformance);
    };
  }, []);

  return null; // Este componente no renderiza nada
};