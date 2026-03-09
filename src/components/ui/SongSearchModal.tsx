import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Music, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { digitalLatinoApi, SpotifyTrackResult, SelectedSong } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SongSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectSong: (song: SelectedSong) => void;
    excludeSongIds?: number[]; // IDs de canciones a excluir (ej: la que ya está seleccionada)
}

export function SongSearchModal({ isOpen, onClose, onSelectSong, excludeSongIds = [] }: SongSearchModalProps) {
    const { toast } = useToast();
    const { user, setShowLoginDialog } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SpotifyTrackResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState<SpotifyTrackResult | null>(null);
    const [confirmingSelection, setConfirmingSelection] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Debounce para búsqueda
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchTracks(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, isOpen]);

    // Enfocar input cuando se abre el modal
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Resetear estado al cerrar
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setSelectedTrack(null);
            setConfirmingSelection(false);
        }
    }, [isOpen]);

    const searchTracks = async (query: string) => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await digitalLatinoApi.getSearchSpotify(query);
            // Filtrar tracks que ya están excluidos (si tienen my_song_id)
            const tracks = response.data.tracks || [];
            const filteredTracks = tracks.filter(track =>
                !track.my_song_id || !excludeSongIds.includes(track.my_song_id)
            );
            setSearchResults(filteredTracks);
        } catch (error) {
            console.error('Error searching tracks:', error);
            toast({
                title: 'Error',
                description: 'No se pudo realizar la búsqueda',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTrackClick = (track: SpotifyTrackResult) => {
        if (!user) {
            setShowLoginDialog(true);
            return;
        }
        setSelectedTrack(track);
        setConfirmingSelection(true);
    };

    const handleConfirmSelection = async () => {
        if (!selectedTrack || !user) return;

        try {
            // Si la canción ya existe en nuestra base de datos (tiene my_song_id)
            if (selectedTrack.my_song_id) {
                const selectedSong: SelectedSong = {
                    cs_song: selectedTrack.my_song_id,
                    spotifyid: selectedTrack.spotify_id,
                    song: selectedTrack.song_name,
                    artists: selectedTrack.artist_name,
                    label: '',
                    avatar: selectedTrack.image_url,
                    rk: 0,
                    score: 0,
                };
                onSelectSong(selectedSong);
                onClose();
            } else {
                // Si no existe, registramos el log y luego procedemos
                try {
                    await digitalLatinoApi.setLogSong({
                        userid: user.id,
                        spotifyid: selectedTrack.spotify_id,
                        isartist: false
                    });

                    // Intentamos obtener el cs_song después de registrar
                    const songResponse = await digitalLatinoApi.getSongBySpotifyId(selectedTrack.spotify_id);

                    const selectedSong: SelectedSong = {
                        cs_song: parseInt(songResponse.data.csSong) || 0,
                        spotifyid: selectedTrack.spotify_id,
                        song: selectedTrack.song_name,
                        artists: selectedTrack.artist_name,
                        label: '',
                        avatar: selectedTrack.image_url,
                        rk: 0,
                        score: 0,
                    };

                    // Si no tenemos cs_song, usamos un valor temporal
                    if (!selectedSong.cs_song) {
                        selectedSong.cs_song = -Date.now(); // ID temporal negativo
                    }

                    onSelectSong(selectedSong);
                    onClose();
                } catch (logError) {
                    console.error('Error registering song:', logError);
                    toast({
                        title: 'Error',
                        description: 'No se pudo registrar la canción',
                        variant: 'destructive',
                    });
                }
            }
        } catch (error) {
            console.error('Error selecting song:', error);
            toast({
                title: 'Error',
                description: 'No se pudo seleccionar la canción',
                variant: 'destructive',
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-white/30">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                            <Music className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Buscar canción para comparar</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Buscador */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Buscar canción en Spotify..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        {loading && (
                            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500 animate-spin" />
                        )}
                    </div>
                </div>

                {/* Resultados o confirmación */}
                <div className="flex-1 overflow-y-auto p-4">
                    {confirmingSelection && selectedTrack ? (
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-700">¿Confirmar selección?</h3>
                            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={selectedTrack.image_url}
                                        alt={selectedTrack.song_name}
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{selectedTrack.song_name}</h4>
                                        <p className="text-sm text-gray-700">{selectedTrack.artist_name}</p>
                                        {selectedTrack.exist_in_db && (
                                            <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                Ya en catálogo
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setConfirmingSelection(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleConfirmSelection}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                                >
                                    Confirmar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {searchResults.length === 0 ? (
                                <div className="text-center py-12">
                                    <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">
                                        {searchQuery.trim()
                                            ? 'No se encontraron canciones'
                                            : 'Escribe para buscar canciones en Spotify'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {searchResults.map((track) => (
                                        <Card
                                            key={track.spotify_id}
                                            className="p-3 cursor-pointer hover:bg-purple-50 transition-colors border border-gray-200"
                                            onClick={() => handleTrackClick(track)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={track.image_url}
                                                    alt={track.song_name}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate">
                                                        {track.song_name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {track.artist_name}
                                                    </p>
                                                </div>
                                                {!user ? (
                                                    <Lock className="w-4 h-4 text-gray-400" />
                                                ) : track.exist_in_db && (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                        En catálogo
                                                    </span>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}