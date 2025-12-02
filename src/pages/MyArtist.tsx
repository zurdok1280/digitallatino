import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Play, Info, Lock, Disc, Calendar, User, TrendingUp } from "lucide-react";
import { digitalLatinoApi, SongsArtistBySpotifyId, Song, SongBasicInfo } from "@/lib/api";
import ChartSongDetails from "@/components/ui/ChartSongDetails"; // Ajusta la ruta si es necesario


interface SongWithDetails extends SongsArtistBySpotifyId {
    songDetails?: SongBasicInfo;
}

export default function MyArtist() {
    const { user, setShowLoginDialog } = useAuth();
    const { toast } = useToast();
    
    // main states
    const [songs, setSongs] = useState<SongWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState<{ [key: number]: boolean }>({});
    const [artistImage, setArtistImage] = useState<string>("");

    // modal states
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [loadingSongDetails, setLoadingSongDetails] = useState(false);
   
    // load songs on mount
    useEffect(() => {
        if (user?.allowedArtistId) {
            fetchArtistSongs();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchArtistSongs = async () => {
        if (!user?.allowedArtistId) return;
        
        setLoading(true);
        try {
            console.log("📥 Obteniendo canciones para ID:", user.allowedArtistId);
            const response = await digitalLatinoApi.getSongsArtistBySpotifyId(user.allowedArtistId, 0);

            const songsData = (response.data || []).map(song => ({
                ...song,
                songDetails: undefined
            }));

            setSongs(songsData);

            if (songsData.length > 0) {
               const sortedByDate = [...songsData].sort((a, b) => {
                const dateA = new Date(a.release_date || 0).getTime();
                const dateB = new Date(b.release_date || 0).getTime();
                return dateB - dateA;
               });
               const latestRelease = sortedByDate[0];
                const imageFound = latestRelease.image_url;
                if (imageFound) setArtistImage(imageFound);
                // load details for each song
                songsData.forEach((song, index) => {
                    if (song.cs_song) {
                        setTimeout(() => {
                            fetchSongDetails(song.cs_song, index);
                        }, index * 150); // delay
                    }
                });
            }
        } catch (error) {
            console.error('❌ Error obteniendo canciones:', error);
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
                    ? { ...song, songDetails: response.data }
                    : song
            ));
        } catch (error) {
            console.error(`Error detalles canción ${csSong}:`, error);
        } finally {
            setLoadingDetails(prev => ({ ...prev, [csSong]: false }));
        }
    };

    // --- Helpers de Datos ---
    const getSongName = (song: SongWithDetails, index: number) => {
        if (song.songDetails?.song) return song.songDetails.song;
        if (song.songDetails?.title) return song.songDetails.title;
        return `Canción ${index + 1}`;
    };

    const getLabel = (song: SongWithDetails) => {
        return song.songDetails?.label || 'Label no disponible';
    };

    const getArtist = (song: SongWithDetails) => {
        return song.songDetails?.artist || user?.allowedArtistName || 'Artista';
    };

    // --- buttons ---
    const handleSongSelect = (song: SongWithDetails) => {
        if (song.spotifyid) {
            const campaignUrl = `/campaign?spotifyId=${song.spotifyid}`;
            window.open(campaignUrl, '_blank');
        } else {
            toast({
                title: "Info no disponible",
                description: "Spotify ID no disponible para esta canción",
                variant: "destructive"
            });
        }
    };

    const handleDetailsClick = async (song: SongWithDetails) => {
        if (!song.spotifyid) return;
        
        setLoadingSongDetails(true);
        try {
            // component artistsong
            const csSongResponse = await digitalLatinoApi.getSongBySpotifyId(song.spotifyid);
            
            if (csSongResponse.data?.cs_song) {
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
                    song: getSongName(song, 0),
                    artists: getArtist(song),
                    label: getLabel(song),
                    crg: '',
                    avatar: song.songDetails?.avatar || song.image_url || '',
                    url: song.spotifyid ? `https://open.spotify.com/track/$${song.spotifyid}` : '',
                    spotifyid: song.spotifyid
                };
                
                setSelectedSong(defaultSongData);
                setIsDetailsOpen(true);
            }
        } catch (error) {
            console.error("Error abriendo detalles:", error);
        } finally {
            setLoadingSongDetails(false);
        }
    };

    // Artist
    if (!user || user.role !== 'ARTIST') {
        return (
            <div className="flex h-[80vh] items-center justify-center flex-col gap-4 text-center p-4">
                <div className="bg-red-100 p-4 rounded-full text-red-500">
                    <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-700">Acceso Restringido</h2>
                <p className="text-gray-500 max-w-md">
                    Esta sección es exclusiva para el Plan Artista. Por favor actualiza tu suscripción.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            
           {/* --- HEADER  --- */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                
                <div className="relative z-10 flex items-center gap-5">
                    {/* AVATAR */}
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-200 shadow-lg ring-4 ring-white overflow-hidden relative flex-shrink-0">
                        {artistImage ? (
                            <img
                                src={artistImage}
                                alt={user.allowedArtistName}
                                className="w-full h-full object-cover"
                                />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl md:text-3xl font-bold text-white">
                                {user.allowedArtistName?.charAt(0) || "A"}
                            </div>
                        )}
                    </div>
                    
                    <div>
                       
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                            {user.allowedArtistName}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-2">
                            <Music className="w-4 h-4 text-purple-500" /> Catálogo Completo
                        </p>
                    </div>
                </div>
            </div>

            {/* --- songs list --- */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-bold text-xl text-slate-700">
                        Canciones ({songs.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-500">Cargando catálogo...</p>
                    </div>
                ) : songs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Music className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-600">No se encontraron canciones</h3>
                        <p className="text-slate-400">Intenta recargar la página.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                        {songs.map((song, index) => (
                            <Card key={index} className="p-4 hover:shadow-md transition-all border border-slate-200 bg-white group">
                                <div className="flex items-center gap-4">
                                    {/* Ranking Badge */}
                                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 text-slate-500 font-bold rounded-full flex items-center justify-center text-sm">
                                        {index + 1}
                                    </div>

                                    {/* Cover Image */}
                                    <div className="relative w-16 h-16 flex-shrink-0">
                                        <img 
                                            src={song.songDetails?.avatar || song.image_url || "/placeholder-music.png"} 
                                            alt="Cover" 
                                            className="w-full h-full object-cover rounded-lg shadow-sm"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=Music';
                                            }}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 truncate" title={getSongName(song, index)}>
                                            {getSongName(song, index)}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <Disc className="w-3 h-3" />
                                            <span className="truncate max-w-[150px]">{getLabel(song)}</span>
                                        </div>
                                        {song.release_date && (
                                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                                <Calendar className="w-3 h-3" />
                                                <span>{new Date(song.release_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleSongSelect(song)}
                                            className="text-xs h-8 px-3 hover:bg-purple-50 hover:text-purple-600 border-slate-200"
                                        >
                                            <TrendingUp className="w-3 h-3 mr-1" /> Campaña
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost"
                                            onClick={() => handleDetailsClick(song)}
                                            disabled={loadingSongDetails || !song.spotifyid}
                                            className="text-xs h-8 px-3 text-slate-500 hover:text-slate-800"
                                        >
                                            <Info className="w-3 h-3 mr-1" /> Detalles
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/*  details Modal */}
            {isDetailsOpen && selectedSong && (
                <ChartSongDetails
                    song={selectedSong}
                    selectedCountry="0"
                    selectedFormat="0"
                    countries={[]}
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                />
            )}
        </div>
    );
}