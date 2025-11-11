import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";
import { AuthProvider } from "./hooks/useAuth";
import { lazy, Suspense } from "react";

// Lazy loading de páginas para optimizar tiempo de carga inicial
const Index = lazy(() => import("./pages/Index"));
const Charts = lazy(() => import("./pages/Charts"));
const Campaign = lazy(() => import("./pages/Campaign"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CampaignDetails = lazy(() => import("./pages/CampaignDetails"));
const WeeklyTopSongs = lazy(() => import("./pages/WeeklyTopSongs"));
const TopPlatforms = lazy(() => import("./pages/TopPlatforms"));
const TopArtists = lazy(() => import("./pages/TopArtists"));
const Debut = lazy(() => import("./pages/Debut"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Payment = lazy(() => import("./pages/PaymentPage"));
const AuthCallback = lazy(() => import("./pages/AuthCallbackPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
// QueryClient optimizado para rendimiento
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos en memoria (era cacheTime)
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

// Loading component optimizado
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground animate-pulse">Cargando...</p>
    </div>
  </div>
);

// HOC para lazy pages con fallback
const withLazy = (Component: React.LazyExoticComponent<() => JSX.Element>) => {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
          <ScrollToTop />
          <Routes>
            <Route path="/" element={withLazy(Charts)} />
            <Route path="/studio" element={withLazy(Index)} />
            <Route path="/dashboard" element={withLazy(Dashboard)} />
            <Route path="/campaign" element={withLazy(Campaign)} />
            <Route path="/campaign-details" element={withLazy(CampaignDetails)} />
            <Route path="/weekly-top-songs" element={withLazy(WeeklyTopSongs)} />
            <Route path="/top-platforms" element={withLazy(TopPlatforms)} />
            <Route path="/top-artists" element={withLazy(TopArtists)} />
            <Route path="/debut" element={withLazy(Debut)} />
            <Route path="/mi-cuenta" element={withLazy(AccountPage)} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route
              path="*"
              element={
                <Suspense fallback={<PageLoader />}>
                  <NotFound />
                </Suspense>
              }
            />
            <Route
              path="/auth/callback"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AuthCallback />
                </Suspense>
              }
            />
            <Route
              path="/payment"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Payment />
                </Suspense>
              }
            />
          </Routes>
        
      </TooltipProvider>
    </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
