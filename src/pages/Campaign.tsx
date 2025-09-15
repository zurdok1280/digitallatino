import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CampaignPreview } from "@/components/CampaignPreview";
import { CampaignCalculator } from "@/components/CampaignCalculator";
import { Search, Music, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SpotifyTrack, CampaignMetrics } from "@/types/spotify";

export default function Campaign() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Obtener parámetros de la URL
  const urlArtist = searchParams.get('artist');
  const urlTrack = searchParams.get('track');
  const urlCoverUrl = searchParams.get('coverUrl');
  const urlArtistImageUrl = searchParams.get('artistImageUrl');
  const urlPreviewUrl = searchParams.get('previewUrl');
  const urlSpotifyUrl = searchParams.get('spotifyUrl');

  // Estados
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [backgroundType, setBackgroundType] = useState<"album" | "artist" | "custom">("album");
  const [customBackground, setCustomBackground] = useState("");
  const [isBlurred, setIsBlurred] = useState(true);
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetrics>({
    cpc: 0.136,
    cpa: 0.77,
    clicks: 367,
    conversions: 65,
    streams: 44,
    totalBudget: 1500
  });

  // Estados para búsqueda de Spotify
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check for existing Spotify connection
  useEffect(() => {
    const savedToken = window.localStorage.getItem('spotify_access_token');
    if (savedToken) {
      setAccessToken(savedToken);
      setIsConnected(true);
    }
  }, []);

  // Función para buscar en Spotify con fallback a iTunes
  const searchSpotify = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Intentar buscar en Spotify primero
      if (accessToken) {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.tracks.items);
          return;
        }
      }
      
      // Fallback a iTunes si Spotify falla o no hay token
      console.log('Usando iTunes como fallback...');
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(`https://itunes.apple.com/search?term=${encodedQuery}&entity=song&limit=10`);
      const data = await response.json();
      
      if (data.results) {
        const iTunesResults = data.results.map((item: any) => ({
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
          popularity: Math.floor(Math.random() * 100) // iTunes no tiene popularidad, usar valor aleatorio
        }));
        setSearchResults(iTunesResults);
      }
      
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Error de búsqueda",
        description: "No se pudo buscar canciones. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchSpotify(searchQuery.trim());
    }
  };

  const handleTrackSelect = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setSearchResults([]);
    setSearchQuery('');
    toast({
      title: "Canción seleccionada",
      description: `${track.artists[0].name} - ${track.name}`,
    });
  };

  const connectToSpotify = () => {
    const clientId = '5001fe1a36c8442781282c9112d599ca'; // Tu client ID
    const redirectUri = encodeURIComponent(window.location.origin);
    const scopes = encodeURIComponent('user-read-private user-read-email');
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}&show_dialog=false`;
    window.location.href = authUrl;
  };
  
  // Auto-conectar a Spotify si no hay token
  useEffect(() => {
    // Manejar callback de Spotify OAuth
    const handleSpotifyCallback = () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get('access_token');
      const expiresIn = params.get('expires_in');

      if (token) {
        const expiryTime = Date.now() + (parseInt(expiresIn || '3600') * 1000);
        
        window.localStorage.setItem('spotify_access_token', token);
        window.localStorage.setItem('spotify_token_expiry', expiryTime.toString());
        
        setAccessToken(token);
        setIsConnected(true);
        
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        
        toast({
          title: "Conectado exitosamente",
          description: "Ya puedes buscar canciones en Spotify."
        });
      }
    };

    handleSpotifyCallback();
    
    // Auto-conexión deshabilitada para no interrumpir al usuario final.
    // Si en el futuro deseas activar Spotify automáticamente, llama a connectToSpotify() aquí
    // después de validar que el Redirect URI esté registrado en el dashboard de Spotify.
  }, [accessToken, isConnected, toast]);
  // Crear track simulado con los datos de la URL
  useEffect(() => {
    if (urlArtist && urlTrack) {
      const simulatedTrack: SpotifyTrack = {
        id: `simulated-${Date.now()}`,
        name: urlTrack,
        artists: [{
          id: `artist-${Date.now()}`,
          name: urlArtist,
          images: urlArtistImageUrl ? [{
            url: urlArtistImageUrl,
            height: 640,
            width: 640
          }] : [],
          external_urls: { spotify: "#" }
        }],
        album: {
          id: `album-${Date.now()}`,
          name: urlTrack,
          images: urlCoverUrl ? [{
            url: urlCoverUrl,
            height: 640,
            width: 640
          }] : []
        },
        external_urls: { spotify: urlSpotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(`${urlArtist} ${urlTrack}`)}` },
        preview_url: urlPreviewUrl || null,
        duration_ms: 180000,
        popularity: 75
      };
      setSelectedTrack(simulatedTrack);

      // Si no viene previewUrl en la URL, intentar obtener el preview desde iTunes como fallback
      if (!urlPreviewUrl) {
        const q = encodeURIComponent(`${urlArtist} ${urlTrack}`);
        fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=1`)
          .then(res => res.json())
          .then(data => {
            const preview = data?.results?.[0]?.previewUrl;
            if (preview) {
              setSelectedTrack(prev => prev ? { ...prev, preview_url: preview } as SpotifyTrack : prev);
            }
          })
          .catch(() => { /* ignore */ });
      }
    }
  }, [urlArtist, urlTrack, urlCoverUrl, urlArtistImageUrl, urlPreviewUrl, urlSpotifyUrl]);

  // Estados adicionales para el resumen dinámico
  const [campaignDays, setCampaignDays] = useState(30);
  const [campaignPlatforms, setCampaignPlatforms] = useState<string[]>(['facebook']);
  const [campaignLocations, setCampaignLocations] = useState<string[]>(['mexico']);
  const [campaignArtists, setCampaignArtists] = useState<string[]>([]);

  const handleMetricsChange = (metrics: CampaignMetrics & { days?: number; platforms?: string[]; locations?: string[]; artists?: string[] }) => {
    setCampaignMetrics(metrics);
    if (metrics.days) setCampaignDays(metrics.days);
    if (metrics.platforms) setCampaignPlatforms(metrics.platforms);
    if (metrics.locations) setCampaignLocations(metrics.locations);
    if (metrics.artists) setCampaignArtists(metrics.artists);
  };

  // Función para formatear las plataformas seleccionadas
  const formatPlatforms = (platforms: string[]) => {
    const platformNames = platforms.map(p => {
      switch(p) {
        case 'facebook': return 'Facebook';
        case 'instagram': return 'Instagram';
        case 'tiktok': return 'TikTok';
        default: return p;
      }
    });
    
    if (platformNames.length === 1) return platformNames[0];
    if (platformNames.length === 2) return `${platformNames[0]} e ${platformNames[1]}`;
    return `${platformNames.slice(0, -1).join(', ')} y ${platformNames[platformNames.length - 1]}`;
  };

  // Función para formatear las ubicaciones seleccionadas
  const formatLocations = (locations: string[]) => {
    if (locations.length === 0) return 'Sin ubicaciones específicas';
    if (locations.length === 1) return '1 ubicación';
    return `${locations.length} ubicaciones`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="rounded-xl"
            >
              ← Volver a Charts
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Crear Campaña Promocional
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedTrack ? `${selectedTrack.artists[0].name} - ${selectedTrack.name}` : 'Configura tu campaña'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/544b8d7c-17e6-4c56-be22-6cb146932d26.png" 
              alt="Digital Latino" 
              className="h-6 w-auto"
            />
            <span className="text-sm text-white">Digital Latino</span>
          </div>
        </div>


        {selectedTrack ? (
          <>
            {/* Introducción Simplificada */}
            <div className="mb-8 space-y-6">
              <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={selectedTrack.artists[0].images[0]?.url || selectedTrack.album.images[0]?.url} 
                        alt={selectedTrack.artists[0].name}
                      />
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {selectedTrack.artists[0].name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        ¡Hola {selectedTrack.artists[0].name}! 
                      </h3>
                      <p className="text-sm text-foreground/70">
                        Digital Latino impulsa carreras musicales profesionales
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">10M+ Streams Generados</span>
                      <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold">500+ Artistas</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">más de 250,000 playlist verificadas de todos los géneros latinos</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🚀</span>
                      <span className="text-sm font-semibold text-foreground">Activa una campaña para crecer en los Charts</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-2 py-1">
                        <span className="text-xs">🎵</span>
                        <span className="font-medium text-green-700 text-xs">Pitch con curadores de playlist verificadas</span>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2 py-1">
                        <span className="text-xs">📱</span>
                        <span className="font-medium text-blue-700 text-xs">Redes Sociales</span>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-purple-50 border border-purple-200 rounded-full px-2 py-1">
                        <span className="text-xs">📊</span>
                        <span className="font-medium text-purple-700 text-xs">Analytics Completos</span>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-full px-2 py-1">
                        <span className="text-xs">📈</span>
                        <span className="font-medium text-orange-700 text-xs">Reportes en Tiempo Real</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Vista Previa de la Campaña */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-lg">📱</span>
                        Vista Previa de la Campaña
                      </CardTitle>
                      <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        SIMULACIÓN
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Así es como se verá tu anuncio en Instagram y Facebook
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <div className="w-full max-w-sm">
                        <CampaignPreview
                          track={selectedTrack}
                          title={campaignTitle}
                          backgroundType={backgroundType}
                          customBackground={customBackground}
                          isBlurred={isBlurred}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Configuración y Métricas */}
              <div className="space-y-6">
                {/* Información de la Canción */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-lg">🎵</span>
                      Información de la Canción
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage 
                          src={selectedTrack.album.images[0]?.url || selectedTrack.artists[0].images[0]?.url} 
                          alt={selectedTrack.name} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                          {selectedTrack.artists[0].name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{selectedTrack.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedTrack.artists[0].name}</p>
                        <div className="mt-2 flex gap-2">
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                            Popularidad: {selectedTrack.popularity}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Calculadora de Campaña */}
                <CampaignCalculator onMetricsChange={handleMetricsChange} />

                {/* Resumen y CTA */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardHeader>
                    <CardTitle className="text-lg">🚀 Resumen de tu Campaña</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <strong>Tu campaña incluye:</strong> Pitch con curadores de playlist verificadas, campañas en redes sociales por {campaignDays} días en {formatPlatforms(campaignPlatforms)}, targeting en {formatLocations(campaignLocations)}{campaignArtists.length > 0 ? `, audiencia de ${campaignArtists.length} artistas similares` : ''}, Analytics y Charts Completos y Reportes en Tiempo Real con resultados de campaña.
                    </p>

                    <div className="pt-4 space-y-3">
                      <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-6 text-base">
                        🎯 Crear Campaña - ${campaignMetrics.totalBudget.toLocaleString()} USD
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Únete a los 500+ artistas que ya crecieron with Digital Latino
                      </p>
                      <div className="text-center mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                          *Resultados no garantizados. Métricas basadas en campañas previas. No vendemos streams.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Header del Buscador */}
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎵</div>
                  <h2 className="text-3xl font-bold text-foreground">Busca tu canción</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Encuentra tu música en Spotify y crea una campaña promocional profesional
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Buscador de Spotify */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">🔍</span>
                  Buscador de Música
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Busca tu música favorita y crea tu campaña promocional
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar artista o canción..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading || !searchQuery.trim()}
                    className="rounded-xl px-6"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </form>

                {/* Resultados de búsqueda */}
                {searchResults.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-foreground">Resultados de búsqueda</h3>
                    <div className="grid gap-3">
                      {searchResults.map((track) => (
                        <div
                          key={track.id}
                          className="flex items-center gap-4 p-4 rounded-xl border border-muted hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleTrackSelect(track)}
                        >
                          <Avatar className="h-12 w-12 rounded-lg">
                            <AvatarImage 
                              src={track.album.images[0]?.url} 
                              alt={track.album.name}
                            />
                            <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-semibold">
                              {track.artists[0].name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">{track.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{track.artists[0].name}</p>
                            <p className="text-xs text-muted-foreground truncate">{track.album.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                            </span>
                            {track.preview_url && (
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Play className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron resultados para "{searchQuery}"</p>
                    <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* O ir a Charts */}
            <Card>
              <CardContent className="py-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">¿Prefieres explorar los Charts?</h3>
                  <p className="text-sm text-muted-foreground">
                    Ve las canciones más populares y selecciona una desde ahí
                  </p>
                  <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="rounded-xl"
                  >
                    Ver Charts Musicales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}