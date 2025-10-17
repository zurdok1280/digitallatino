import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SpotifyTrack } from "@/types/spotify";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Music, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchResultProps {
    track: SpotifyTrack;
    onSelect: (track: SpotifyTrack) => void;
}

function SearchResult({ track, onSelect }: SearchResultProps) {
    const handleClick = () => {
        onSelect(track);
    };

    return (
        <Card className="p-4 cursor-pointer hover:bg-accent/50 transition-all border border-white/20 bg-white/40 backdrop-blur-sm">
            <div className="flex items-center gap-4" onClick={handleClick}>
                <div className="relative">
                    <img
                        src={track.album.images[0]?.url}
                        alt={track.album.name}
                        className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                        <Music className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-1">{track.name}</h3>
                    <p className="text-sm text-slate-600 mb-2">{track.artists.map(artist => artist.name).join(', ')}</p>
                    <p className="text-xs text-slate-500">{track.album.name}</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-slate-600 via-gray-700 to-blue-700 text-white border-none hover:from-slate-700 hover:via-gray-800 hover:to-blue-800"
                >
                    Ver Campaña
                </Button>
            </div>
        </Card>
    );
}


export function SearchArtist() {
    const { toast } = useToast();
    const navigate = useNavigate();

    // Spotify search state
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isConnected, setIsConnected] = useState(false);



    //Debouncing para limitar las busquedas por API al usuario
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
    }
    // Usar el hook de debounce con 100ms de delay
    const debouncedSearchQuery = useDebounce(searchQuery, 100);

    // Search tracks on Spotify   //Aislar
    const searchTracks = useCallback(async (query: string) => {
        console.log('searchTracks called with:', query);
        console.log('accessToken:', accessToken);
        console.log('isConnected:', isConnected);
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        };

        if (!accessToken) {
            console.log('No access token, using iTunes fallback...');
            setLoadingSearch(true);
            try {
                const encodedQuery = encodeURIComponent(query);
                const response = await fetch(`https://itunes.apple.com/search?term=${encodedQuery}&entity=song&limit=25`);
                const data = await response.json();
                const items: SpotifyTrack[] = (data.results || []).map((item: any) => {
                    const artwork = item.artworkUrl100 ? item.artworkUrl100.replace('100x100', '512x512') : '';
                    return {
                        id: String(item.trackId || item.collectionId || Math.random()),
                        name: item.trackName || item.collectionName || 'Unknown',
                        artists: [{
                            id: String(item.artistId || ''),
                            name: item.artistName || 'Unknown Artist',
                            images: [],
                            external_urls: { spotify: '' }
                        }],
                        album: {
                            id: String(item.collectionId || ''),
                            name: item.collectionName || '',
                            images: artwork ? [{ url: artwork, height: 512, width: 512 }] : []
                        },
                        external_urls: { spotify: '' },
                        preview_url: item.previewUrl || null,
                        duration_ms: 0,
                        popularity: 0
                    } as SpotifyTrack;
                });
                setSearchResults(items);
                setShowSearchResults(true);
                if (items.length === 0) {
                    toast({
                        title: "Sin resultados",
                        description: `No se encontraron canciones para "${query}"`,
                    });
                }
            } catch (e) {
                console.error('iTunes fallback error', e);
                toast({
                    title: "Error",
                    description: "No se pudo buscar. Intenta de nuevo.",
                    variant: "destructive"
                });
            } finally {
                setLoadingSearch(false);
            }
            return;
        }

        setLoadingSearch(true);
        try {
            const encodedQuery = encodeURIComponent(query);
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=10&market=US`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.tracks.items);
                setShowSearchResults(true);

                if (data.tracks.items.length === 0) {
                    toast({
                        title: "Sin resultados",
                        description: `No se encontraron canciones para "${query}"`,
                    });
                }
            } else {
                throw new Error('Search failed');
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoadingSearch(false);
        }
    }, [accessToken, toast]);

    // Handle search result selection
    const handleSearchResultSelect = (track: SpotifyTrack) => {
        const params = new URLSearchParams({
            artist: track.artists.map(artist => artist.name).join(', '),
            track: track.name,
            coverUrl: track.album.images[0]?.url || '',
            artistImageUrl: track.artists[0]?.images?.[0]?.url || '',
            previewUrl: track.preview_url || '',
            spotifyUrl: (track as any).external_urls?.spotify || ''
        });
        navigate(`/campaign?${params.toString()}`);
    };

    //useEffect para buscar cuando el query cambia
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
            {/* Aislar componente de busqueda en Itunes/Spotify*/}
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
                                placeholder="Buscar artista o canción..."
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
                                            ? `${searchResults.length} resultados encontrados`
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
                                        <div key={track.id} className="border-b border-gray-100 last:border-b-0">
                                            <SearchResult
                                                track={track}
                                                onSelect={handleSearchResultSelect}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        {loadingSearch ? 'Buscando...' : 'No se encontraron resultados'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
                {!showSearchResults && searchQuery && (
                    <div className="text-xs text-slate-500 text-center">
                        Escribe para buscar en tiempo real...
                    </div>
                )}
            </div>
            {/* Aislar componente de busqueda en Itunes/Spotify*/}
        </>
    )
};
