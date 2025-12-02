import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, X, Play, Calendar, TrendingUp, Disc, User, Info, Lock } from "lucide-react";
import { digitalLatinoApi, SongsArtistBySpotifyId, SongBasicInfo, Song } from "@/lib/api";
import ChartSongDetails from "./ChartSongDetails";
import { useAuth } from "@/hooks/useAuth";
import Portal from "./Portal";

interface ArtistSongsProps {
    spotifyId: string;
    artistName: string;
    isOpen: boolean;
    onClose: () => void;
}

interface SongWithDetails extends SongsArtistBySpotifyId {
    songDetails?: SongBasicInfo;
}

export function ArtistSongs({ spotifyId, artistName, isOpen, onClose }: ArtistSongsProps) {
    const { toast } = useToast();
    const { user, setShowLoginDialog } = useAuth();
    const [songs, setSongs] = useState<SongWithDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState<{ [key: number]: boolean }>({});

    // Estado para el modal de detalles de canción
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [loadingSongDetails, setLoadingSongDetails] = useState(false);

    // Bloquear scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && spotifyId) {
            fetchArtistSongs();
        }
    }, [isOpen, spotifyId]);

    const fetchArtistSongs = async () => {
        setLoading(true);
        try {
            const response = await digitalLatinoApi.getSongsArtistBySpotifyId(spotifyId, 0);

            const songsData = (response.data || []).map(song => ({
                ...song,
                songDetails: undefined
            }));

            setSongs(songsData);

            if (songsData.length === 0) {
                toast({
                    title: "Sin canciones",
                    description: `No se encontraron canciones para ${artistName}`,
                });
            } else {
                // Cargar detalles adicionales para cada canción sin perder los datos originales
                songsData.forEach((song, index) => {
                    if (song.cs_song) {
                        setTimeout(() => {
                            fetchSongDetails(song.cs_song, index);
                        }, index * 100);
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error obteniendo canciones del artista:', error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las canciones del artista",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSongDetails = async (csSong: number, index: number) => {
        setLoadingDetails(prev => ({ ...prev, [csSong]: true }));

        try {
            const response = await digitalLatinoApi.getSongById(csSong);
            setSongs(prev => prev.map(song =>
                song.cs_song === csSong
                    ? {
                        ...song,
                        songDetails: response.data
                    }
                    : song
            ));
        } catch (error) {
            console.error(`❌ Error obteniendo detalles adicionales para canción ${csSong}:`, error);
        } finally {
            setLoadingDetails(prev => ({ ...prev, [csSong]: false }));
        }
    };

    const handleSongSelect = (song: SongWithDetails) => {

        if (song.spotifyid) {
            const campaignUrl = `/campaign?spotifyId=${song.spotifyid}`;
            window.open(campaignUrl, '_blank');
        } else {
            toast({
                title: "Información no disponible",
                description: "No se puede abrir la campaña para esta canción - Spotify ID no disponible",
                variant: "destructive"
            });
        }
    };
    const handleDetailsClick = async (song: SongWithDetails) => {

        if (!user) {
            setShowLoginDialog(true);
            return;
        }

        if (!song.spotifyid) {
            toast({
                title: "Información no disponible",
                description: "No se puede cargar los detalles - Spotify ID no disponible",
                variant: "destructive"
            });
            return;
        }

        setLoadingSongDetails(true);
        try {
            const csSongResponse = await digitalLatinoApi.getSongBySpotifyId(song.spotifyid);

            if (csSongResponse.data && csSongResponse.data.cs_song) {
                const csSong = csSongResponse.data.cs_song;
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
                    score: song.score || 0,
                    rk_total: 0,
                    tw_spins: 0,
                    tw_aud: 0,
                    rk: 0,
                    spotify_streams: song.spotify_streams || 0,
                    entid: 0,
                    length_sec: 0,
                    song: getSongName(song, songs.indexOf(song)),
                    artists: getArtist(song),
                    label: getLabel(song),
                    crg: '',
                    avatar: song.songDetails?.avatar || song.image_url || '',
                    url: song.spotifyid ? `https://open.spotify.com/track/${song.spotifyid}` : '',
                    spotifyid: song.spotifyid
                };

                console.log('🎵 Datos para ChartSongDetails:', defaultSongData);
                setSelectedSong(defaultSongData);
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
            setLoadingSongDetails(false);
        }
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setSelectedSong(null);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getSongName = (song: SongWithDetails, index: number) => {
        // Prioridad: songDetails.song > songDetails.title > placeholder
        if (song.songDetails?.song) return song.songDetails.song;
        if (song.songDetails?.title) return song.songDetails.title;
        return `Canción ${index + 1}`;
    };

    const getLabel = (song: SongWithDetails) => {
        return song.songDetails?.label || 'Disquera no disponible';
    };

    const getArtist = (song: SongWithDetails) => {
        return song.songDetails?.artist || artistName;
    };

    if (!isOpen) return null;

    return (
        <>
            <Portal>
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
                    onClick={handleBackdropClick}
                >
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white"
                            title="Cerrar"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Header */}
                        <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Canciones de {artistName}
                                    </h2>
                                    <p className="text-sm text-white/90 mt-1">
                                        {loading ? 'Cargando...' : `${songs.length} canciones encontradas`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            <div className="p-6">
                                {loading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-sm text-slate-600">Cargando canciones de {artistName}...</p>
                                        </div>
                                    </div>
                                ) : songs.length > 0 ? (
                                    <div className="grid gap-4">
                                        {songs.map((song, index) => (
                                            <Card
                                                key={song.cs_song || index}
                                                className="p-4 cursor-pointer hover:bg-accent/50 transition-all border border-gray-200"
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Número de ranking */}
                                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-sm font-bold">
                                                            {index + 1}
                                                        </span>
                                                    </div>

                                                    {/* Imagen del álbum */}
                                                    {song.image_url ? (
                                                        <img
                                                            src={song.image_url}
                                                            alt="Album cover"
                                                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                            <Music className="w-8 h-8 text-gray-400" />
                                                        </div>
                                                    )}

                                                    {/* Información de la canción */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-slate-800 mb-1">
                                                            {getSongName(song, index)}
                                                        </h3>

                                                        <div className="flex items-center gap-2 mb-2">
                                                            <User className="w-3 h-3 text-slate-500" />
                                                            <span className="text-sm text-slate-600">{getArtist(song)}</span>
                                                        </div>

                                                        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                                                            {/* Disquera/Label */}
                                                            <div className="flex items-center gap-1">
                                                                <Disc className="w-3 h-3" />
                                                                <span>{getLabel(song)}</span>
                                                            </div>

                                                            {/* Fecha de lanzamiento */}
                                                            {song.release_date && (
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span>Lanzamiento: {new Date(song.release_date).toLocaleDateString()}</span>
                                                                </div>
                                                            )}

                                                            {/* Loading indicator para detalles */}
                                                            {loadingDetails[song.cs_song] && (
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                                                    <span>Cargando detalles...</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Botones de acción */}
                                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="bg-gradient-to-r from-slate-600 via-gray-700 to-blue-700 text-white border-none hover:from-slate-700 hover:via-gray-800 hover:to-blue-800 flex items-center gap-1"
                                                            onClick={() => handleSongSelect(song)}
                                                        >
                                                            <Play className="w-3 h-3" />
                                                            Ver Campaña
                                                        </Button>

                                                        {user ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={loadingSongDetails || !song.spotifyid}
                                                                className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-none hover:from-green-700 hover:to-teal-700 flex items-center gap-1"
                                                                onClick={() => handleDetailsClick(song)}
                                                            >
                                                                <Info className="w-3 h-3" />
                                                                {loadingSongDetails ? "Cargando..." : "Detalles"}
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
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-slate-700 mb-2">
                                            No se encontraron canciones
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            No hay canciones disponibles para {artistName} en este momento.
                                        </p>
                                        <Button
                                            onClick={fetchArtistSongs}
                                            variant="outline"
                                            className="mt-4"
                                        >
                                            Reintentar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Portal>

            {/* Modal de Detalles - ChartSongDetails */}
            {isDetailsOpen && selectedSong && (
                <ChartSongDetails
                    song={selectedSong}
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