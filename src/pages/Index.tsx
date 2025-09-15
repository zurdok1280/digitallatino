import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Download, Sparkles, Music, Target, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import { SpotifyAuth } from '@/components/SpotifyAuth';
import { TrackList } from '@/components/TrackList';
import { CampaignPreview } from '@/components/CampaignPreview';
import { CampaignCalculator } from '@/components/CampaignCalculator';
import { CampaignCustomizer } from '@/components/CampaignCustomizer';
import { ModernHero } from '@/components/ModernHero';
import { AppSidebar } from '@/components/AppSidebar';

import { SpotifyTrack, CampaignMetrics } from '@/types/spotify';

// Spotify API configuration  
const DEFAULT_CLIENT_ID = '5001fe1a36c8442781282c9112d599ca'; // Pre-configured client ID
const SPOTIFY_CONFIG = {
  client_id: DEFAULT_CLIENT_ID,
  redirect_uri: window.location.origin,
  scope: 'user-read-private user-read-email',
};

// Auto-save the client ID
if (typeof window !== 'undefined') {
  window.localStorage.setItem('spotify_client_id', DEFAULT_CLIENT_ID);
}

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [campaignTitle, setCampaignTitle] = useState('');
  const [backgroundType, setBackgroundType] = useState<'album' | 'artist' | 'custom'>('album');
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [isBlurred, setIsBlurred] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const configSectionRef = useRef<HTMLDivElement>(null);
  // Handle background change from customizer
  const handleBackgroundChange = (type: 'album' | 'artist' | 'custom', url?: string) => {
    setBackgroundType(type);
    if (url) {
      setCustomBackground(url);
    }
  };

  // Spotify PKCE OAuth Flow
  const connectToSpotify = useCallback(async (clientId: string) => {
    SPOTIFY_CONFIG.client_id = clientId;
    window.localStorage.setItem('spotify_client_id', clientId);
    
    // Generate code verifier and challenge for PKCE
    const generateRandomString = (length: number) => {
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const values = crypto.getRandomValues(new Uint8Array(length));
      return values.reduce((acc, x) => acc + possible[x % possible.length], "");
    };

    const sha256 = async (plain: string) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(plain);
      return window.crypto.subtle.digest('SHA-256', data);
    };

    const base64encode = (input: ArrayBuffer) => {
      return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    };

    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    // Store the code verifier for later use
    window.localStorage.setItem('code_verifier', codeVerifier);

    // Construct authorization URL
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    const params = {
      response_type: 'code',
      client_id: clientId,
      scope: SPOTIFY_CONFIG.scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: SPOTIFY_CONFIG.redirect_uri,
    };

    authUrl.search = new URLSearchParams(params).toString();

    // Debug logs
    const inIframe = window.self !== window.top;
    console.log('[Spotify] Starting OAuth', {
      origin: window.location.origin,
      redirect_uri: SPOTIFY_CONFIG.redirect_uri,
      client_id: clientId,
      inIframe,
    });
    console.log('[Spotify] Auth URL', authUrl.toString());

    // Navigate respecting iframe constraints
    const urlStr = authUrl.toString();
    try {
      if (inIframe) {
        // Open in a new tab to avoid X-Frame-Options issues inside the preview iframe
        const newTab = window.open(urlStr, '_blank', 'noopener,noreferrer');
        if (!newTab) {
          // Fallback via programmatic anchor click
          const a = document.createElement('a');
          a.href = urlStr;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
        toast.info('Continúa en Spotify', {
          description: 'Se abrió una pestaña nueva para autorizar la conexión.',
          icon: '🎵'
        });
      } else {
        // Not in iframe, safe to navigate this window
        window.location.href = urlStr;
      }
    } catch (e) {
      // Last resort
      window.location.href = urlStr;
    }
  }, [toast]);

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      const codeVerifier = window.localStorage.getItem('code_verifier');
      
      if (!codeVerifier) {
        toast.error("No se encontró el code verifier. Intenta de nuevo.");
        return;
      }
      
      const storedClientId = window.localStorage.getItem('spotify_client_id');
      if (!storedClientId) {
        toast.error("No se encontró el Client ID. Intenta conectar de nuevo.");
        return;
      }
      SPOTIFY_CONFIG.client_id = storedClientId;

      try {
        console.log('[Spotify] Exchanging code for token', {
          code,
          redirect_uri: SPOTIFY_CONFIG.redirect_uri,
          client_id: storedClientId,
        });
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: SPOTIFY_CONFIG.client_id,
            grant_type: 'authorization_code',
            code,
            redirect_uri: SPOTIFY_CONFIG.redirect_uri,
            code_verifier: codeVerifier,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.access_token);
          setIsConnected(true);
          
          // Save token, expiry and client ID
          const expiresAt = Date.now() + ((data.expires_in ?? 3600) * 1000);
          window.localStorage.setItem('spotify_access_token', data.access_token);
          window.localStorage.setItem('spotify_token_expiry', String(expiresAt));
          window.localStorage.removeItem('code_verifier');
          
          // Clean up URL
          window.history.replaceState({}, document.title, '/');
          toast.success("¡Conectado!", {
            description: "Ya puedes buscar música en Spotify.",
            icon: '✅'
          });
        } else {
          const errText = await response.text();
          console.error('[Spotify] Token exchange failed', response.status, errText);
          throw new Error('Failed to get access token');
        }
      } catch (error) {
        console.error('Error during token exchange:', error);
        toast.error("Error de conexión", {
          description: "No se pudo conectar con Spotify. Verifica tu Client ID."
        });
      }
    }
  }, [toast]);

  // Search tracks using iTunes as primary source (no auth required)
  const searchTracks = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const encodedQuery = encodeURIComponent(query);
      
      // Use iTunes Search API directly (no authentication required)
      const response = await fetch(`https://itunes.apple.com/search?term=${encodedQuery}&entity=song&limit=20&country=US&media=music`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const iTunesResults: SpotifyTrack[] = data.results.map((item: any) => ({
            id: item.trackId.toString(),
            name: item.trackName,
            artists: [{
              id: item.artistId.toString(),
              name: item.artistName,
              images: [],
              external_urls: { spotify: `https://open.spotify.com/search/${encodeURIComponent(`${item.artistName} ${item.trackName}`)}` }
            }],
            album: {
              id: item.collectionId?.toString() || 'unknown',
              name: item.collectionName || item.trackName,
              images: item.artworkUrl100 ? [{
                url: item.artworkUrl100.replace('100x100', '640x640'),
                height: 640,
                width: 640
              }] : []
            },
            external_urls: { spotify: `https://open.spotify.com/search/${encodeURIComponent(`${item.artistName} ${item.trackName}`)}` },
            preview_url: item.previewUrl || null,
            duration_ms: item.trackTimeMillis || 180000,
            popularity: Math.floor(Math.random() * 80) + 20 // Random popularity between 20-100
          }));
          
          setSearchResults(iTunesResults);
          
          toast.success("Búsqueda completada", {
            description: `Se encontraron ${iTunesResults.length} canciones`,
            icon: '🎵'
          });
        } else {
          setSearchResults([]);
          toast.info("Sin resultados", {
            description: `No se encontraron canciones para "${query}"`,
            icon: '🔍'
          });
        }
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Error de búsqueda", {
        description: "No se pudo completar la búsqueda. Intenta de nuevo."
      });
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Handle track selection with auto-scroll
  const handleTrackSelect = useCallback((track: SpotifyTrack) => {
    setSelectedTrack(track);
    
    // Scroll to configuration section after a short delay
    setTimeout(() => {
      configSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 300);
    
    toast.success("¡Canción seleccionada!", {
      description: `${track.name} por ${track.artists.map(a => a.name).join(', ')}`,
      icon: '⭐'
    });
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchTracks(searchQuery.trim());
    }
  };

  // Download preview as PNG
  const downloadPreview = useCallback(async () => {
    if (!previewRef.current || !selectedTrack) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `${selectedTrack.name}_campaign_preview.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success("¡Descargado!", {
        description: "El preview de la campaña se ha guardado como imagen.",
        icon: '📸'
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Error al descargar", {
        description: "No se pudo generar la imagen. Intenta de nuevo."
      });
    }
  }, [selectedTrack]);

  // Check for saved credentials on mount
  useEffect(() => {
    const savedToken = window.localStorage.getItem('spotify_access_token');
    const savedClientId = window.localStorage.getItem('spotify_client_id');
    const expiry = Number(window.localStorage.getItem('spotify_token_expiry') || '0');
    
    // Check for OAuth callback first
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
      handleOAuthCallback();
      return;
    }

    if (savedToken && savedClientId && expiry > Date.now()) {
      setAccessToken(savedToken);
      setIsConnected(true);
      SPOTIFY_CONFIG.client_id = savedClientId;
    } else {
      // Clear invalid/expired token
      if (savedToken && expiry <= Date.now()) {
        window.localStorage.removeItem('spotify_access_token');
        window.localStorage.removeItem('spotify_token_expiry');
      }
      setAccessToken(null);
      setIsConnected(false);

      // Auto-connect silently if we have a client ID
      const clientId = savedClientId || SPOTIFY_CONFIG.client_id;
      if (clientId) {
        connectToSpotify(clientId);
      }
    }
  }, [handleOAuthCallback, connectToSpotify]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header with Trigger */}
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-subtle">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden hover:scale-110 transition-transform duration-200" />
                <div className="animate-fade-in">
                  <h2 className="font-semibold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Campaign Studio</h2>
                  <p className="text-sm text-muted-foreground">Crea campañas que generan resultados</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Link to="/">
                <Button 
                    variant="glass" 
                    size="sm" 
                    className="backdrop-blur-md"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Inicio (Charts)
                  </Button>
                </Link>
                <Button variant="glass" size="sm" className="backdrop-blur-md">
                  <Target className="w-4 h-4 mr-2" />
                  Mis Campañas
                </Button>
                <Button variant="premium" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade Pro
                </Button>
              </div>
            </div>
          </header>


          {/* Hero Section */}
          <ModernHero />

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="space-y-12">
              {/* Step 1: Spotify Connection */}
              <section className="animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                    <span className="text-sm font-bold text-white">1</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Conecta tu música</h2>
                    <p className="text-muted-foreground">Accede a tu catálogo de Spotify</p>
                  </div>
                </div>
                
                <div className="bg-gradient-subtle backdrop-blur-sm rounded-2xl border border-border/50 shadow-glass p-8 hover:shadow-float transition-all duration-300">
                  <SpotifyAuth onConnect={connectToSpotify} isConnected={isConnected} defaultClientId={SPOTIFY_CONFIG.client_id} />
                </div>
              </section>

              {/* Step 2: Search Music */}
              <section className="animate-slide-up">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                      <span className="text-sm font-bold text-white">2</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Busca tu música</h2>
                      <p className="text-muted-foreground">Encuentra la canción perfecta para promocionar</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-subtle backdrop-blur-sm rounded-2xl border border-border/50 shadow-glass p-8 hover:shadow-float transition-all duration-300">
                    <form onSubmit={handleSearch} className="flex gap-4 mb-8">
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="Busca tu canción, álbum o colaboración..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-white/80 border-border/50 backdrop-blur-sm h-12 text-lg shadow-subtle hover:shadow-medium focus:shadow-glow transition-all duration-300"
                          disabled={loading}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={!searchQuery.trim() || loading}
                        className="px-8 h-12 shadow-glow hover:shadow-float"
                      >
                        <Search className="w-5 h-5 mr-2" />
                        {loading ? 'Buscando...' : 'Buscar'}
                      </Button>
                    </form>

                    {/* Search Results */}
                    <TrackList
                      tracks={searchResults}
                      onTrackSelect={handleTrackSelect}
                      selectedTrack={selectedTrack}
                      loading={loading}
                    />
                  </div>
                </section>

              {/* Step 3: Campaign Preview & Calculator */}
              {selectedTrack && (
                <section ref={configSectionRef} className="animate-scale-in">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                      <span className="text-sm font-bold text-white">3</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Configura tu campaña</h2>
                      <p className="text-muted-foreground">Personaliza y descarga tu material promocional</p>
                    </div>
                  </div>

                  <div className="space-y-12">
                    {/* Preview & Calculator Section */}
                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* Campaign Preview */}
                      <div className="bg-gradient-glass backdrop-blur-sm rounded-2xl border border-white/20 shadow-glass p-8">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-primary" />
                            <h3 className="text-xl font-semibold">Preview de Campaña</h3>
                          </div>
                          <Button
                            onClick={downloadPreview}
                            size="sm"
                            variant="outline"
                            className="bg-white/50 hover:bg-white/70"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </Button>
                        </div>

                        <div className="flex justify-center">
                          <CampaignPreview 
                            ref={previewRef} 
                            track={selectedTrack}
                            title={campaignTitle}
                            backgroundType={backgroundType}
                            customBackground={customBackground}
                            isBlurred={isBlurred}
                          />
                        </div>
                      </div>

                      {/* Campaign Calculator */}
                      <div>
                        <CampaignCalculator onMetricsChange={setMetrics} />
                        
                        {/* Buy Now Button */}
                        {metrics && (
                          <div className="mt-6">
                            <div className="bg-gradient-glass backdrop-blur-sm rounded-2xl border border-white/20 shadow-glass p-6">
                              <Button
                                size="lg"
                                className="w-full bg-gradient-to-r from-primary to-primary-glow text-white font-bold text-lg py-6 hover:shadow-glow transition-all duration-300 transform hover:scale-105 shadow-lg"
                              >
                                🚀 COMPRAR CAMPAÑA
                              </Button>
                              <div className="mt-4 text-center">
                                <p className="text-2xl font-bold text-primary">${metrics.totalBudget.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">Inicia tu promoción musical profesional</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Campaign Customizer Section */}
                    <div className="max-w-2xl mx-auto">
                      <CampaignCustomizer 
                        onTitleChange={setCampaignTitle}
                        onBackgroundChange={handleBackgroundChange}
                        onBlurChange={setIsBlurred}
                      />
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
