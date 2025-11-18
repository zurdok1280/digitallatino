import BoxCampaign from './buttonInfoSong-components/boxCampaign';
import React, { useState, useEffect } from 'react';
import { Play, Pause, Star, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Song, Country, CityDataForSong, digitalLatinoApi } from '@/lib/api';
import BoxElementsDisplay from './buttonInfoSong-components/boxElementsDisplay';
import BoxDisplayInfoPlatform from './buttonInfoSong-components/boxDisplayInfoPlatform';
import BoxPlaylistsDisplay from './buttonInfoSong-components/boxPlaylistsDisplay';
import BoxTikTokInfluencers from './buttonInfoSong-components/boxTikTokInfluencers';
import Portal from './Portal';

interface ChartSongDetailsProps {
    song: Song;
    selectedCountry?: string;
    selectedFormat?: string;
    countries?: Country[];
    onPlayPreview?: (rk: number, audioUrl: string) => void;
    currentlyPlaying?: number | null;
    isOpen: boolean;
    onClose: () => void;
}

const ChartSongDetails: React.FC<ChartSongDetailsProps> = ({
    song,
    selectedCountry = "0",
    selectedFormat = "0",
    countries = [],
    onPlayPreview,
    currentlyPlaying,
    isOpen,
    onClose
}) => {
    const [cityData, setCityData] = useState<CityDataForSong[]>([]);
    const [loadingCityData, setLoadingCityData] = useState(false);

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

    // Cargar datos de ciudades directamente
    const loadCityData = async () => {
        if (!song.cs_song) return;

        setLoadingCityData(true);
        try {
            console.log('🔍 Cargando datos de ciudades para cs_song:', song.cs_song);

            // Usar countryId = 1 por defecto ya que todos los paises traen todas las ciudades
            const countryId = 1;

            const response = await digitalLatinoApi.getCityData(song.cs_song, countryId);
            console.log('📊 Respuesta de getCityData:', response);

            if (response.data) {
                setCityData(response.data);
                console.log('✅ Datos de ciudades cargados directamente:', response.data.length, 'ciudades');
            }
        } catch (error) {
            console.error('❌ Error cargando datos de ciudades:', error);
        } finally {
            setLoadingCityData(false);
        }
    };

    // Llamar esta función cuando el componente se monte o cuando cambie el cs_song
    useEffect(() => {
        if (isOpen && song.cs_song) {
            loadCityData();
        }
    }, [isOpen, song.cs_song]);

    const handlePlayPreview = (rk: number, audioUrl: string) => {
        if (onPlayPreview) {
            onPlayPreview(rk, audioUrl);
        }
    };

    const formatNumber = (num: number): string => {
        if (num === null || num === undefined || isNaN(num) || num === 0) {
            return '0';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
                onClick={handleBackdropClick}
            >
                <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                    {/* Botón flotante en esquina superior derecha */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white"
                        title="Cerrar detalles"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    {/* Header fijo */}
                    <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative">

                        <div className="grid grid-cols-12 items-center gap-4">
                            {/* Rank */}
                            <div className="col-span-1 flex items-center justify-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
                                    <div className="relative bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl w-16 h-16 flex items-center justify-center shadow-lg">
                                        <span className="text-2xl font-bold text-white">
                                            #{song.rk || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Track Info */}
                            <div className="col-span-8 flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="relative h-20 w-20 rounded-xl shadow-lg border-2 border-white/30">
                                        <AvatarImage
                                            src={song.avatar}
                                            alt={song.song}
                                            className="rounded-xl object-cover"
                                        />
                                        <AvatarFallback className="rounded-xl bg-white/20 text-white font-bold text-lg">
                                            {song.artists && typeof song.artists === 'string'
                                                ? song.artists
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .slice(0, 2)
                                                    .toUpperCase()
                                                : '??'
                                            }
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePlayPreview(
                                                    song.rk || 0,
                                                    `https://audios.monitorlatino.com/Iam/${song.entid || 0}.mp3`
                                                );
                                            }}
                                            className="w-12 h-12 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-all duration-300 shadow-2xl transform hover:scale-110"
                                            aria-label={`Reproducir preview de ${song.song}`}
                                        >
                                            {currentlyPlaying === song.rk ? (
                                                <Pause className="w-5 h-5" />
                                            ) : (
                                                <Play className="w-5 h-5 ml-0.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl font-bold text-white leading-tight mb-2">
                                        {song.song || 'Canción no disponible'}
                                    </h1>
                                    <p className="text-lg font-semibold text-white/90 mb-1">
                                        {song.artists || 'Artista no disponible'}
                                    </p>
                                    <p className="text-base text-white/80 mb-3">
                                        {song.label || 'Label no disponible'}
                                    </p>
                                </div>
                            </div>

                            {/* Digital Score */}
                            <div className="col-span-3 text-right">
                                <div className="relative bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 shadow-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                            <span className="text-xs font-bold text-white uppercase tracking-wide">
                                                Digital Score
                                            </span>
                                        </div>
                                        <Star className="w-4 h-4 text-yellow-300 fill-current" />
                                    </div>
                                    <div className="text-3xl font-black text-white">
                                        {song.score || 0}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenido scrollable */}
                    <div className="flex-1 overflow-y-auto bg-gray-50">
                        <div className="p-6 space-y-6">
                            {/* Campaña de promoción */}
                            <BoxCampaign
                                spotifyId={song.spotifyid}
                                csSong={song.cs_song}
                            />

                            {/* Top de ciudades */}
                            { }
                            <BoxElementsDisplay
                                label={"Top Cities Digital"}
                                csSong={song.cs_song.toString()}
                                countries={countries}

                            />

                            {/* Estadísticas de Plataformas */}
                            <BoxDisplayInfoPlatform
                                csSong={song.cs_song}
                                formatId={selectedFormat ? parseInt(selectedFormat) : 0}
                            />

                            {/* Playlist Info */}
                            <BoxPlaylistsDisplay csSong={song.cs_song} />

                            {/* TikTok Influencers */}
                            <BoxTikTokInfluencers csSong={song.cs_song} />
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default ChartSongDetails;