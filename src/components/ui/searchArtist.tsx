import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Music, Search, Info, Lock } from "lucide-react";
import { digitalLatinoApi, SpotifyTrackResult, Song } from "@/lib/api";
import ChartSongDetails from "./ChartSongDetails";
import { useAuth } from "@/hooks/useAuth";

interface SearchResultProps {
    track: SpotifyTrackResult;
    onSelect: (track: SpotifyTrackResult) => void;
}

function SearchResult({ track, onSelect }: SearchResultProps) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [songDetails, setSongDetails] = useState<Song | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const { toast } = useToast();
    const { user, setShowLoginDialog } = useAuth();

    const handleClick = () => {
        onSelect(track);
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(track);
    };

    const handleDetailsClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            setShowLoginDialog(true);
            return;
        }

        setLoadingDetails(true);
        try {
            console.log('🔍 Llamando a getSongBySpotifyId con spotify_id:', track.spotify_id);

            // Paso 1: Obtener el csSong usando el spotifyId
            const csSongResponse = await digitalLatinoApi.getSongBySpotifyId(track.spotify_id);

            console.log('📊 URL completa de getSongBySpotifyId:', `report/getcssong?spotifyid=${track.spotify_id}`);
            console.log('📦 Respuesta de getSongBySpotifyId:', csSongResponse);
            console.log('🎵 csSong recibido:', csSongResponse.data);

            if (csSongResponse.data && csSongResponse.data.cs_song) {
                const csSong = csSongResponse.data.cs_song;
                console.log('✅ cs_song encontrado:', csSong);

                // Crear objeto Song con valores por defecto usando la información que tenemos
                const defaultSongData: Song = {
                    cs_song: csSong,
                    spotify_streams_total: 0,
                    tiktok_views_total: 0,
                    youtube_video_views_total: 0,
                    youtube_short_views_total: 0,
                    shazams_total: 0,
                    soundcloud_stream_total: 0,
                    pan_streams: 0,
                    audience_total: 0,
                    spins_total: 0,
                    score: 0,
                    rk_total: 0,
                    tw_spins: 0,
                    tw_aud: 0,
                    rk: 0,
                    spotify_streams: 0,
                    entid: 0,
                    length_sec: 0,
                    song: track.song_name || 'Canción no disponible',
                    artists: track.artist_name || 'Artista no disponible',
                    label: 'Label no disponible',
                    crg: '',
                    avatar: track.image_url || '',
                    url: track.url || '',
                    spotifyid: track.spotify_id || ''
                };

                console.log('🎵 Datos por defecto creados:', defaultSongData);

                setSongDetails(defaultSongData);
                setIsDetailsOpen(true);

            } else {
                console.log('❌ No se encontró cs_song en la respuesta');
                toast({
                    title: "Información no disponible",
                    description: "No se encontró el ID de la canción",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('❌ Error obteniendo detalles de la canción:', error);
            toast({
                title: "Error",
                description: "No se pudo cargar la información detallada de la canción",
                variant: "destructive"
            });
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setSongDetails(null);
    };

    return (
        <>
            <Card className="p-4 cursor-pointer hover:bg-accent/50 transition-all border border-white/20 bg-white/40 backdrop-blur-sm">
                <div className="flex items-center gap-4" >
                    <div className="relative">
                        <img
                            src={track.image_url}
                            alt={track.song_name}
                            className="w-24 h-24 rounded-lg object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <Music className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 mb-1">{track.song_name}</h3>
                        <p className="text-sm text-slate-600 mb-2">{track.artist_name}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-gradient-to-r from-slate-600 via-gray-700 to-blue-700 text-white border-none hover:from-slate-700 hover:via-gray-800 hover:to-blue-800"
                            onClick={handleButtonClick}
                        >
                            Ver Campaña
                        </Button>

                        {user ? (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={loadingDetails}
                                className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-none hover:from-green-700 hover:to-teal-700 flex items-center gap-1"
                                onClick={handleDetailsClick}
                            >
                                <Info className="w-3 h-3" />
                                {loadingDetails ? "Cargando..." : "Detalles"}
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-none hover:from-green-700 hover:to-teal-700 flex items-center gap-1 cursor-pointer"
                                onClick={() => setShowLoginDialog(true)}
                            >
                                <Lock className="w-3 h-3" />
                                Detalles
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Modal de Detalles */}
            {isDetailsOpen && songDetails && (
                <ChartSongDetails
                    song={songDetails}
                    selectedCountry="0"
                    selectedFormat="0"
                    countries={[]}
                    isOpen={isDetailsOpen}
                    onClose={handleCloseDetails}
                />
            )}
        </>
    );
}

export function SearchArtist() {
    const { toast } = useToast();

    // Spotify search state
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [searchResults, setSearchResults] = useState<SpotifyTrackResult[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Debouncing para limitar las búsquedas por API al usuario
    const useDebounce = (value: string, delay: number) => {
        const [debouncedValue, setDebouncedValue] = useState(value);

        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);
        return debouncedValue;
    };

    // Usar el hook de debounce con 300ms de delay
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Search tracks on Spotify usando la nueva API
    const searchTracks = useCallback(async (query: string) => {
        console.log('🔍 Buscando en Spotify:', query);

        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setLoadingSearch(true);
        try {
            const response = await digitalLatinoApi.getSearchSpotify(query);
            console.log('✅ Respuesta de Spotify:', response.data);

            // Usar solo los tracks de la respuesta
            const tracks = response.data.tracks || [];
            setSearchResults(tracks);
            setShowSearchResults(true);

            if (tracks.length === 0) {
                toast({
                    title: "Sin resultados",
                    description: `No se encontraron canciones para "${query}" en Spotify`,
                });
            }
        } catch (error) {
            console.error('❌ Error buscando en Spotify:', error);
            toast({
                title: "Error",
                description: "No se pudo buscar en Spotify. Intenta de nuevo.",
                variant: "destructive"
            });
            setSearchResults([]);
        } finally {
            setLoadingSearch(false);
        }
    }, [toast]);

    // Handle search result selection - MODIFICADO para usar spotify_id real
    const handleSearchResultSelect = (track: SpotifyTrackResult) => {
        // Abrir en nueva pestaña con el spotify_id real
        if (track.spotify_id) {
            const campaignUrl = `/campaign?spotifyId=${track.spotify_id}`;
            window.open(campaignUrl, '_blank');
        } else {
            // Fallback si no hay spotify_id
            const params = new URLSearchParams({
                artist: track.artist_name,
                track: track.song_name,
                coverUrl: track.image_url || '',
                spotifyUrl: track.url || ''
            });
            const campaignUrl = `/campaign?${params.toString()}`;
            window.open(campaignUrl, '_blank');
        }
    };

    // useEffect para buscar cuando el query cambia
    useEffect(() => {
        if (debouncedSearchQuery.trim()) {
            searchTracks(debouncedSearchQuery);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    }, [debouncedSearchQuery, searchTracks]);

    return (
        <>
            {/* Search Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    {/*<div className="flex items-center gap-2">
                        <span className="text-xl">🔍</span>
                        <h2 className="text-lg font-semibold text-slate-700">¿No encuentras tu artista en los charts?</h2>
                    </div>*/}
                </div>

                <div className="relative">
                    <div className="flex gap-2 items-center" >

                        <div className="flex-1 relative">
                            <Input
                                placeholder="Buscar artista o canción en Spotify..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-96 rounded-2xl border-0 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm shadow-md focus:ring-2 focus:ring-blue-400 pr-10"
                            />
                            {/* Loading */}
                            {loadingSearch && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>

                        <Button
                            type="button"
                            onClick={() => searchQuery.trim() && searchTracks(searchQuery)}
                            disabled={loadingSearch || !searchQuery.trim()}
                            className="rounded-2xl bg-gradient-to-r from-slate-600 via-gray-700 to-blue-700 px-6 py-3 text-white hover:from-slate-700 hover:via-gray-800 hover:to-blue-800"
                        >
                            <Search className="w-4 h-4" />
                        </Button>

                    </div>

                    {/* Search Results en tiempo real */}
                    {showSearchResults && (
                        <div className="absolute z-50 mt-2 w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-hidden">
                            <div className="p-3 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-slate-700">
                                        {searchResults.length > 0
                                            ? `${searchResults.length} resultados encontrados en Spotify`
                                            : 'Buscando...'
                                        }
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowSearchResults(false);
                                            setSearchQuery('');
                                            setSearchResults([]);
                                        }}
                                        className="text-slate-400 hover:text-slate-600 transition-colors text-xs"
                                    >
                                        ✕ Cerrar
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {searchResults.length > 0 ? (
                                    searchResults.map((track) => (
                                        <div key={track.spotify_id} className="border-b border-gray-100 last:border-b-0">
                                            <SearchResult
                                                track={track}
                                                onSelect={handleSearchResultSelect}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        {loadingSearch ? 'Buscando en Spotify...' : 'No se encontraron resultados en Spotify'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
                {!showSearchResults && searchQuery && (
                    <div className="text-xs text-slate-500 text-center">
                        Escribe para buscar en tiempo real en Spotify...
                    </div>
                )}
            </div>
        </>
    )
}