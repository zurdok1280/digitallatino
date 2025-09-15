import React, { lazy, Suspense } from 'react';
import { ComponentType } from 'react';

// Lazy loading usando named exports
export const CampaignPreview = lazy(() => 
  import('./CampaignPreview').then(module => ({ default: module.CampaignPreview }))
);

export const CampaignCalculator = lazy(() => 
  import('./CampaignCalculator').then(module => ({ default: module.CampaignCalculator }))
);

export const CampaignCustomizer = lazy(() => 
  import('./CampaignCustomizer').then(module => ({ default: module.CampaignCustomizer }))
);

export const TrackList = lazy(() => 
  import('./TrackList').then(module => ({ default: module.TrackList }))
);

// Componente de loading optimizado
const OptimizedLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

// HOC para crear componente con loading fallback
export const withSuspense = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={fallback || <OptimizedLoader />}>
      <Component {...props} />
    </Suspense>
  );
  
  WrappedComponent.displayName = `withSuspense(${Component.displayName || Component.name})`;
  return WrappedComponent;
};