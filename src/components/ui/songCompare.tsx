import React, { useState, useEffect } from 'react';
import { X, BarChart3, MapPin, TrendingUp, TrendingDown, Music, Globe, ChevronLeft, ChevronRight, ListMusic, Video, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { digitalLatinoApi, VsSongData, SelectedSong, VsSongPlaylistsData, VsSongTiktoksData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Backdrop, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface SongCompareProps {
    isOpen: boolean;
    onClose: () => void;
    song1: SelectedSong;
    song2: SelectedSong;
}

type PlaylistSortKey = keyof VsSongPlaylistsData | 'song1_position' | 'song2_position';
type TiktokSortKey = keyof VsSongTiktoksData | 'song1_metrics' | 'song2_metrics';

export function SongCompare({ isOpen, onClose, song1, song2 }: SongCompareProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [loadingPlaylists, setLoadingPlaylists] = useState(false);
    const [loadingTiktoks, setLoadingTiktoks] = useState(false);
    const [comparisonData, setComparisonData] = useState<VsSongData[]>([]);
    const [playlistsData, setPlaylistsData] = useState<VsSongPlaylistsData[]>([]);
    const [tiktoksData, setTiktoksData] = useState<VsSongTiktoksData[]>([]);
    const [activeTab, setActiveTab] = useState('table');

    // Sort config for main table
    const [sortConfig, setSortConfig] = useState<{
        key: keyof VsSongData | 'winner';
        direction: 'asc' | 'desc';
    }>({ key: 'dif_streams', direction: 'desc' });

    // Sort config for playlists table
    const [playlistSortConfig, setPlaylistSortConfig] = useState<{
        key: PlaylistSortKey;
        direction: 'asc' | 'desc';
    }>({ key: 'followers_count', direction: 'desc' });

    // Sort config for tiktok table
    const [tiktokSortConfig, setTiktokSortConfig] = useState<{
        key: TiktokSortKey;
        direction: 'asc' | 'desc';
    }>({ key: 'tiktok_user_followers', direction: 'desc' });

    const [currentPage, setCurrentPage] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const itemsPerPage = 1000;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '15px';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && song1 && song2) {
            fetchComparisonData();
            fetchPlaylistsData();
            fetchTiktoksData();
        }
    }, [isOpen, song1, song2]);

    const fetchComparisonData = async () => {
        try {
            setLoading(true);
            const response = await digitalLatinoApi.getVsSongs(song1.cs_song, song2.cs_song);
            setComparisonData(response.data);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching comparison data:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los datos de comparación',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchPlaylistsData = async () => {
        try {
            setLoadingPlaylists(true);
            const response = await digitalLatinoApi.getVsSongPlaylists(song1.cs_song, song2.cs_song);
            setPlaylistsData(response.data);
        } catch (error) {
            console.error('Error fetching playlists data:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los datos de playlists',
                variant: 'destructive',
            });
        } finally {
            setLoadingPlaylists(false);
        }
    };

    const fetchTiktoksData = async () => {
        try {
            setLoadingTiktoks(true);
            const response = await digitalLatinoApi.getVsSongTiktoks(song1.cs_song, song2.cs_song);
            setTiktoksData(response.data);
        } catch (error) {
            console.error('Error fetching tiktoks data:', error);
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los datos de TikTok',
                variant: 'destructive',
            });
        } finally {
            setLoadingTiktoks(false);
        }
    };

    // Sort functions for each tab
    const getSortedData = () => {
        return [...comparisonData].sort((a, b) => {
            if (sortConfig.key === 'winner') {
                const aWins = a.first_streams > a.second_streams ? 1 : -1;
                const bWins = b.first_streams > b.second_streams ? 1 : -1;
                return sortConfig.direction === 'asc' ? aWins - bWins : bWins - aWins;
            }

            const aValue = a[sortConfig.key as keyof VsSongData];
            const bValue = b[sortConfig.key as keyof VsSongData];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            // String comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            return 0;
        });
    };

    const getSortedPlaylistsData = () => {
        return [...playlistsData].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (playlistSortConfig.key) {
                case 'song1_position':
                    aValue = a.first_current_position;
                    bValue = b.first_current_position;
                    break;
                case 'song2_position':
                    aValue = a.second_current_position;
                    bValue = b.second_current_position;
                    break;
                default:
                    aValue = a[playlistSortConfig.key as keyof VsSongPlaylistsData];
                    bValue = b[playlistSortConfig.key as keyof VsSongPlaylistsData];
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return playlistSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return playlistSortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            return 0;
        });
    };

    const getSortedTiktoksData = () => {
        return [...tiktoksData].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (tiktokSortConfig.key) {
                case 'song1_metrics':
                    // Ordenar por suma de vistas + likes + comentarios de la canción 1
                    aValue = (a.first_views_total || 0) + (a.first_likes_total || 0) + (a.first_comments_total || 0);
                    bValue = (b.first_views_total || 0) + (b.first_likes_total || 0) + (b.first_comments_total || 0);
                    break;
                case 'song2_metrics':
                    // Ordenar por suma de vistas + likes + comentarios de la canción 2
                    aValue = (a.second_views_total || 0) + (a.second_likes_total || 0) + (a.second_comments_total || 0);
                    bValue = (b.second_views_total || 0) + (b.second_likes_total || 0) + (b.second_comments_total || 0);
                    break;
                default:
                    aValue = a[tiktokSortConfig.key as keyof VsSongTiktoksData];
                    bValue = b[tiktokSortConfig.key as keyof VsSongTiktoksData];
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return tiktokSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return tiktokSortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            return 0;
        });
    };

    const sortedData = getSortedData();
    const sortedPlaylistsData = getSortedPlaylistsData();
    const sortedTiktoksData = getSortedTiktoksData();

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const calculateMetrics = () => {
        if (comparisonData.length === 0) return null;

        const totalCities = comparisonData.length;
        const citiesSong1Wins = comparisonData.filter(item => item.first_streams > item.second_streams).length;
        const citiesSong2Wins = comparisonData.filter(item => item.second_streams > item.first_streams).length;
        const totalStreamsSong1 = comparisonData.reduce((acc, item) => acc + item.first_streams, 0);
        const totalStreamsSong2 = comparisonData.reduce((acc, item) => acc + item.second_streams, 0);
        const avgScore1 = comparisonData.reduce((acc, item) => acc + item.first_score, 0) / totalCities;
        const avgScore2 = comparisonData.reduce((acc, item) => acc + item.second_score, 0) / totalCities;

        return {
            totalCities,
            citiesSong1Wins,
            citiesSong2Wins,
            totalStreamsSong1,
            totalStreamsSong2,
            streamDifference: totalStreamsSong1 - totalStreamsSong2,
            avgScore1,
            avgScore2,
        };
    };

    const metrics = calculateMetrics();

    const chartData = comparisonData
        .sort((a, b) => Math.abs(b.dif_streams) - Math.abs(a.dif_streams))
        .slice(0, isMobile ? 5 : 10)
        .map(item => ({
            name: isMobile ? item.city_name.substring(0, 10) + '...' : item.city_name,
            city_name: item.city_name,
            country: item.country_code,
            [song1.song.substring(0, 15)]: Math.round(item.first_streams),
            [song2.song.substring(0, 15)]: Math.round(item.second_streams),
            dif: Math.round(item.dif_streams),
            winner: item.first_streams > item.second_streams ? 'song1' : 'song2',
        }));

    // Sort handlers
    const requestSort = (key: keyof VsSongData | 'winner') => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
        }));
    };

    const requestPlaylistSort = (key: PlaylistSortKey) => {
        setPlaylistSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
        }));
    };

    const requestTiktokSort = (key: TiktokSortKey) => {
        setTiktokSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
        }));
    };

    const formatNumber = (num: number) => {
        if (num === 0) return <span className="text-gray-400">-</span>;
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)} M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)} K`;
        if (num <= -1000000) return `${(num / 1000000).toFixed(1)} M`;
        if (num <= -1000) return `${(num / 1000).toFixed(1)} K`;
        return num.toLocaleString();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatNumberSimple = (num: number) => {
        if (num === 0) return <span className="text-gray-400">-</span>;
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    };

    const renderSortIcon = (currentKey: string, configKey: string, direction: string) => {
        if (currentKey !== configKey) return null;
        return direction === 'asc' ?
            <ArrowUp className="w-3 h-3 inline-block ml-1" /> :
            <ArrowDown className="w-3 h-3 inline-block ml-1" />;
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-2 md:p-4 overflow-hidden"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <div className={`
          bg-gradient-to-br from-white to-gray-50/95 backdrop-blur-lg rounded-2xl 
          shadow-2xl border border-white/30 flex flex-col
          ${isMobile
                        ? 'w-full h-[95vh] p-3'
                        : 'max-w-6xl w-full h-[90vh] p-4'
                    }
        `}>
                    {/* Header para moviles */}
                    {isMobile ? (
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="rounded-full hover:bg-gray-100 -ml-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                    <BarChart3 className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-sm font-bold text-gray-900">Comparar</h2>
                            </div>
                            <div className="w-8" />
                        </div>
                    ) : (
                        // Header para desktop
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                                    <BarChart3 className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Comparación de Canciones</h2>
                                    <p className="text-sm text-gray-600">Análisis detallado por ciudad, playlists y TikTok</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="rounded-full hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {/* Canciones comparadas */}
                    <div className={`
            grid gap-3 mb-4
            ${isMobile ? 'grid-cols-1' : 'grid-cols-2 gap-6'}
          `}>
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-3 md:p-4 border border-purple-200">
                            <div className="flex items-start gap-2 md:gap-3">
                                <div className={`
                  bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg 
                  flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden
                  ${isMobile ? 'w-12 h-12 text-xs' : 'w-16 h-16'}
                `}>
                                    {song1.avatar ? (
                                        <img
                                            src={song1.avatar}
                                            alt={song1.song}
                                            className="w-full h-full rounded-lg object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                            }}
                                        />
                                    ) : (
                                        <span>{song1.song.substring(0, 2).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`
                    font-bold text-gray-900 truncate
                    ${isMobile ? 'text-sm' : 'text-lg'}
                  `}>
                                        {song1.song}
                                    </h3>
                                    <p className={`
                    text-gray-700 truncate
                    ${isMobile ? 'text-xs' : 'text-sm'}
                  `}>
                                        {song1.artists}
                                    </p>
                                    <p className={`
                    text-gray-500 truncate
                    ${isMobile ? 'text-[10px]' : 'text-xs'}
                  `}>
                                        {song1.label}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 md:mt-2">
                                        <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-purple-100 text-purple-700 rounded text-[10px] md:text-xs font-bold">
                                            #{song1.rk}
                                        </span>
                                        <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-gray-100 text-gray-700 rounded text-[10px] md:text-xs font-bold">
                                            Score: {song1.score}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-3 md:p-4 border border-blue-200">
                            <div className="flex items-start gap-2 md:gap-3">
                                <div className={`
                  bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg 
                  flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden
                  ${isMobile ? 'w-12 h-12 text-xs' : 'w-16 h-16'}
                `}>
                                    {song2.avatar ? (
                                        <img
                                            src={song2.avatar}
                                            alt={song2.song}
                                            className="w-full h-full rounded-lg object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                            }}
                                        />
                                    ) : (
                                        <span>{song2.song.substring(0, 2).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`
                    font-bold text-gray-900 truncate
                    ${isMobile ? 'text-sm' : 'text-lg'}
                  `}>
                                        {song2.song}
                                    </h3>
                                    <p className={`
                    text-gray-700 truncate
                    ${isMobile ? 'text-xs' : 'text-sm'}
                  `}>
                                        {song2.artists}
                                    </p>
                                    <p className={`
                    text-gray-500 truncate
                    ${isMobile ? 'text-[10px]' : 'text-xs'}
                  `}>
                                        {song2.label}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1 md:mt-2">
                                        <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-blue-100 text-blue-700 rounded text-[10px] md:text-xs font-bold">
                                            #{song2.rk}
                                        </span>
                                        <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-gray-100 text-gray-700 rounded text-[10px] md:text-xs font-bold">
                                            Score: {song2.score}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Métricas generales */}
                    {metrics && (
                        <div className={`
              grid gap-2 mb-4
              ${isMobile ? 'grid-cols-2' : 'grid-cols-4 gap-3'}
            `}>
                            <Card className="p-2 md:p-3 bg-white/80 backdrop-blur-sm">
                                <div className="text-center">
                                    <div className="text-lg md:text-2xl font-bold text-gray-900">
                                        {metrics.totalCities}
                                    </div>
                                    <div className="text-[10px] md:text-xs text-gray-600 flex items-center justify-center gap-1">
                                        <MapPin className="w-2 h-2 md:w-3 md:h-3" />
                                        Ciudades
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-2 md:p-3 bg-white/80 backdrop-blur-sm">
                                <div className="text-center">
                                    <div className="text-lg md:text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
                                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                                        {metrics.citiesSong1Wins}
                                    </div>
                                    <div className="text-[10px] md:text-xs text-gray-600 truncate">
                                        {isMobile ? song1.song.substring(0, 8) : song1.song}
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-2 md:p-3 bg-white/80 backdrop-blur-sm">
                                <div className="text-center">
                                    <div className="text-lg md:text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                                        {metrics.citiesSong2Wins}
                                    </div>
                                    <div className="text-[10px] md:text-xs text-gray-600 truncate">
                                        {isMobile ? song2.song.substring(0, 8) : song2.song}
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-2 md:p-3 bg-white/80 backdrop-blur-sm">
                                <div className="text-center">
                                    <div className="text-lg md:text-2xl font-bold text-gray-900">
                                        {metrics.streamDifference === 0 ? (
                                            <span className="text-gray-400">-</span>
                                        ) : (
                                            <>
                                                {metrics.streamDifference < 0 ? '' : ''}
                                                {metrics.streamDifference <= -1000000
                                                    ? `${(metrics.streamDifference / -1000000).toFixed(1)} M`
                                                    : metrics.streamDifference <= -1000
                                                        ? `${(metrics.streamDifference / -1000).toFixed(1)} K`
                                                        : metrics.streamDifference.toLocaleString()}
                                            </>
                                        )}
                                    </div>
                                    <div className="text-[10px] md:text-xs text-gray-600">
                                        Diff. Streams
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Tabs - AHORA CON 4 TABS: Tabla, Playlists, TikTok, Gráficos */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                        <div className={`
              border-b border-gray-200 mb-3
              ${isMobile ? 'overflow-x-auto pb-1' : ''}
            `}>
                            <TabsList className={`
                ${isMobile ? 'inline-flex w-auto' : 'grid w-full grid-cols-4'}
              `}>
                                <TabsTrigger value="table" className={isMobile ? 'px-4 py-1.5 text-xs' : ''}>
                                    📊 Tabla
                                </TabsTrigger>
                                <TabsTrigger value="playlists" className={isMobile ? 'px-4 py-1.5 text-xs' : ''}>
                                    🎵 Playlists
                                </TabsTrigger>
                                <TabsTrigger value="tiktok" className={isMobile ? 'px-4 py-1.5 text-xs' : ''}>
                                    🎬 TikTok
                                </TabsTrigger>
                                <TabsTrigger value="charts" className={isMobile ? 'px-4 py-1.5 text-xs' : ''}>
                                    📈 Gráficos
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Contenido de tabs */}
                        <div className="flex-1 overflow-auto min-h-0">
                            {/* TABLA PRINCIPAL */}
                            <TabsContent value="table" className="h-full m-0">
                                {loading ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <CircularProgress size={isMobile ? 32 : 40} />
                                            <p className="mt-2 text-xs md:text-sm text-gray-600">
                                                Cargando datos...
                                            </p>
                                        </div>
                                    </div>
                                ) : paginatedData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <Music className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
                                            <p className="text-xs md:text-sm text-gray-600">
                                                No hay datos de comparación disponibles
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Tabla comparativa */}
                                        <div className="overflow-x-auto rounded-lg md:rounded-xl border border-gray-200">
                                            <table className="w-full min-w-[600px] md:min-w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th
                                                            className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                            onClick={() => requestSort('city_name')}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                Ciudad
                                                                {renderSortIcon(sortConfig.key, 'city_name', sortConfig.direction)}
                                                            </div>
                                                        </th>
                                                        <th
                                                            className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                            onClick={() => requestSort('first_streams')}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                {song1.song.substring(0, 8)}
                                                                {renderSortIcon(sortConfig.key, 'first_streams', sortConfig.direction)}
                                                            </div>
                                                        </th>
                                                        <th
                                                            className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                            onClick={() => requestSort('second_streams')}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                {song2.song.substring(0, 8)}
                                                                {renderSortIcon(sortConfig.key, 'second_streams', sortConfig.direction)}
                                                            </div>
                                                        </th>
                                                        <th
                                                            className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                            onClick={() => requestSort('dif_streams')}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                Diferencia
                                                                {renderSortIcon(sortConfig.key, 'dif_streams', sortConfig.direction)}
                                                            </div>
                                                        </th>
                                                        <th
                                                            className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                            onClick={() => requestSort('winner')}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                Ganador
                                                                {renderSortIcon(sortConfig.key, 'winner', sortConfig.direction)}
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {paginatedData.map((item, index) => (
                                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                            <td className="py-2 md:py-3 px-2 md:px-4">
                                                                <div className="flex items-center gap-1 md:gap-2">
                                                                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                                                                    <span className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[100px] md:max-w-none">
                                                                        {item.city_name}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-2 md:py-3 px-2 md:px-4">
                                                                <div className="text-xs md:text-sm font-bold text-purple-700">
                                                                    {item.first_streams === 0 ? (
                                                                        <span className="text-gray-400">-</span>
                                                                    ) : (
                                                                        formatNumber(item.first_streams)
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-2 md:py-3 px-2 md:px-4">
                                                                <div className="text-xs md:text-sm font-bold text-blue-700">
                                                                    {item.second_streams === 0 ? (
                                                                        <span className="text-gray-400">-</span>
                                                                    ) : (
                                                                        formatNumber(item.second_streams)
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-2 md:py-3 px-2 md:px-4">
                                                                {item.dif_streams === 0 || item.first_streams === 0 || item.second_streams === 0 ? (
                                                                    <span className="text-xs md:text-sm font-bold text-gray-400">-</span>
                                                                ) : (
                                                                    <div className={`
                                                                        text-xs md:text-sm font-bold
                                                                        ${item.dif_streams > 0 ? 'text-green-600' : 'text-red-600'}
                                                                    `}>
                                                                        {item.dif_streams > 0 ? '+' : ''}
                                                                        {formatNumber(item.dif_streams)}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="py-2 md:py-3 px-2 md:px-4">
                                                                {item.first_streams > item.second_streams ? (
                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] md:text-xs">
                                                                        <TrendingUp className="w-2 h-2 md:w-3 md:h-3" />
                                                                        <span className="truncate max-w-[60px] md:max-w-none">
                                                                            {song1.song.substring(0, 8)}...
                                                                        </span>
                                                                    </span>
                                                                ) : item.second_streams > item.first_streams ? (
                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] md:text-xs">
                                                                        <TrendingUp className="w-2 h-2 md:w-3 md:h-3" />
                                                                        <span className="truncate max-w-[60px] md:max-w-none">
                                                                            {song2.song.substring(0, 8)}...
                                                                        </span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full bg-gray-100 text-gray-700 text-[10px] md:text-xs">
                                                                        Empate
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Paginación */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between mt-3 md:mt-4 px-1">
                                                <div className="text-[10px] md:text-xs text-gray-600">
                                                    {`${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                                                        currentPage * itemsPerPage,
                                                        sortedData.length
                                                    )} de ${sortedData.length}`}
                                                </div>
                                                <div className="flex gap-1 md:gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage === 1}
                                                        className={isMobile ? 'h-7 px-2 text-xs' : ''}
                                                    >
                                                        Anterior
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={currentPage === totalPages}
                                                        className={isMobile ? 'h-7 px-2 text-xs' : ''}
                                                    >
                                                        Siguiente
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </TabsContent>

                            {/* TABLA DE PLAYLISTS - CON SORT */}
                            <TabsContent value="playlists" className="h-full m-0">
                                {loadingPlaylists ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <CircularProgress size={isMobile ? 32 : 40} />
                                            <p className="mt-2 text-xs md:text-sm text-gray-600">
                                                Cargando datos de playlists...
                                            </p>
                                        </div>
                                    </div>
                                ) : sortedPlaylistsData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <ListMusic className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
                                            <p className="text-xs md:text-sm text-gray-600">
                                                No hay datos de playlists disponibles
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg md:rounded-xl border border-gray-200">
                                        <table className="w-full min-w-[800px] md:min-w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th
                                                        className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                        onClick={() => requestPlaylistSort('playlist_name')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Playlist
                                                            {renderSortIcon(playlistSortConfig.key, 'playlist_name', playlistSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                        onClick={() => requestPlaylistSort('owner_name')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Dueño
                                                            {renderSortIcon(playlistSortConfig.key, 'owner_name', playlistSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                        onClick={() => requestPlaylistSort('playlist_type')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Tipo
                                                            {renderSortIcon(playlistSortConfig.key, 'playlist_type', playlistSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                        onClick={() => requestPlaylistSort('followers_count')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Seguidores
                                                            {renderSortIcon(playlistSortConfig.key, 'followers_count', playlistSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider" colSpan={2}>
                                                        <div className="text-center">{song1.song.substring(0, 15)}</div>
                                                    </th>
                                                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider" colSpan={2}>
                                                        <div className="text-center">{song2.song.substring(0, 15)}</div>
                                                    </th>
                                                </tr>
                                                <tr className="bg-gray-100/50">
                                                    <th></th>
                                                    <th></th>
                                                    <th></th>
                                                    <th></th>
                                                    <th
                                                        className="py-1 px-2 text-[9px] md:text-xs text-gray-500 cursor-pointer hover:bg-gray-200"
                                                        onClick={() => requestPlaylistSort('song1_position')}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            Posición
                                                            {renderSortIcon(playlistSortConfig.key, 'song1_position', playlistSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="py-1 px-2 text-[9px] md:text-xs text-gray-500 cursor-pointer hover:bg-gray-200"
                                                        onClick={() => requestPlaylistSort('first_added_at')}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            Agregada
                                                            {renderSortIcon(playlistSortConfig.key, 'first_added_at', playlistSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="py-1 px-2 text-[9px] md:text-xs text-gray-500 cursor-pointer hover:bg-gray-200"
                                                        onClick={() => requestPlaylistSort('song2_position')}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            Posición
                                                            {renderSortIcon(playlistSortConfig.key, 'song2_position', playlistSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="py-1 px-2 text-[9px] md:text-xs text-gray-500 cursor-pointer hover:bg-gray-200"
                                                        onClick={() => requestPlaylistSort('second_added_at')}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            Agregada
                                                            {renderSortIcon(playlistSortConfig.key, 'second_added_at', playlistSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {sortedPlaylistsData.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <span className="text-xs md:text-sm font-medium text-gray-900 truncate block max-w-[150px]">
                                                                {item.playlist_name}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <span className="text-xs md:text-sm text-gray-700">
                                                                {item.owner_name}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <span className="inline-flex px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[9px] md:text-xs">
                                                                {item.playlist_type}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <span className="text-xs md:text-sm font-medium text-gray-900">
                                                                {formatNumberSimple(item.followers_count)}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <div className="text-center">
                                                                {item.first_current_position === 0 ? (
                                                                    <span className="text-xs md:text-sm font-bold text-gray-400">-</span>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-xs md:text-sm font-bold text-purple-700">
                                                                            #{item.first_current_position}
                                                                        </span>
                                                                        {item.first_top_position && item.first_top_position < item.first_current_position && (
                                                                            <span className="ml-1 text-[9px] text-green-600">
                                                                                (top #{item.first_top_position})
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <span className="text-[9px] md:text-xs text-gray-600">
                                                                {formatDate(item.first_added_at)}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <div className="text-center">
                                                                {item.second_current_position === 0 ? (
                                                                    <span className="text-xs md:text-sm font-bold text-gray-400">-</span>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-xs md:text-sm font-bold text-blue-700">
                                                                            #{item.second_current_position}
                                                                        </span>
                                                                        {item.second_top_position && item.second_top_position < item.second_current_position && (
                                                                            <span className="ml-1 text-[9px] text-green-600">
                                                                                (top #{item.second_top_position})
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <span className="text-[9px] md:text-xs text-gray-600">
                                                                {formatDate(item.second_added_at)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </TabsContent>

                            {/* TABLA DE TIKTOK - CON SORT */}
                            <TabsContent value="tiktok" className="h-full m-0">
                                {loadingTiktoks ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <CircularProgress size={isMobile ? 32 : 40} />
                                            <p className="mt-2 text-xs md:text-sm text-gray-600">
                                                Cargando datos de TikTok...
                                            </p>
                                        </div>
                                    </div>
                                ) : sortedTiktoksData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <Video className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
                                            <p className="text-xs md:text-sm text-gray-600">
                                                No hay datos de TikTok disponibles
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg md:rounded-xl border border-gray-200">
                                        <table className="w-full min-w-[800px] md:min-w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th
                                                        className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                        onClick={() => requestTiktokSort('user_name')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Usuario
                                                            {renderSortIcon(tiktokSortConfig.key, 'user_name', tiktokSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                        onClick={() => requestTiktokSort('tiktok_user_followers')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Seguidores
                                                            {renderSortIcon(tiktokSortConfig.key, 'tiktok_user_followers', tiktokSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider" colSpan={3}>
                                                        <div className="text-center">{song1.song.substring(0, 15)}</div>
                                                    </th>
                                                    <th className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider" colSpan={3}>
                                                        <div className="text-center">{song2.song.substring(0, 15)}</div>
                                                    </th>
                                                </tr>
                                                <tr className="bg-gray-100/50">
                                                    <th></th>
                                                    <th></th>
                                                    <th
                                                        className="py-1 px-2 text-[9px] md:text-xs text-gray-500 cursor-pointer hover:bg-gray-200"
                                                        onClick={() => requestTiktokSort('first_no_videos')}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            Videos
                                                            {renderSortIcon(tiktokSortConfig.key, 'first_no_videos', tiktokSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="py-1 px-2 text-[9px] md:text-xs text-gray-500 cursor-pointer hover:bg-gray-200"
                                                        onClick={() => requestTiktokSort('first_views_total')}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            Vistas
                                                            {renderSortIcon(tiktokSortConfig.key, 'first_views_total', tiktokSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="py-1 px-2 text-[9px] md:text-xs text-gray-500 cursor-pointer hover:bg-gray-200"
                                                        onClick={() => requestTiktokSort('first_likes_total')}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            Likes
                                                            {renderSortIcon(tiktokSortConfig.key, 'first_likes_total', tiktokSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="py-1 px-2 text-[9px] md:text-xs text-gray-500 cursor-pointer hover:bg-gray-200"
                                                        onClick={() => requestTiktokSort('second_no_videos')}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            Videos
                                                            {renderSortIcon(tiktokSortConfig.key, 'second_no_videos', tiktokSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="py-1 px-2 text-[9px] md:text-xs text-gray-500 cursor-pointer hover:bg-gray-200"
                                                        onClick={() => requestTiktokSort('second_views_total')}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            Vistas
                                                            {renderSortIcon(tiktokSortConfig.key, 'second_views_total', tiktokSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                    <th
                                                        className="py-1 px-2 text-[9px] md:text-xs text-gray-500 cursor-pointer hover:bg-gray-200"
                                                        onClick={() => requestTiktokSort('second_likes_total')}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            Likes
                                                            {renderSortIcon(tiktokSortConfig.key, 'second_likes_total', tiktokSortConfig.direction)}
                                                        </div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {sortedTiktoksData.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <div>
                                                                <span className="text-xs md:text-sm font-medium text-gray-900 block">
                                                                    {item.user_name}
                                                                </span>
                                                                <span className="text-[9px] md:text-xs text-gray-500">
                                                                    @{item.user_handle}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <span className="text-xs md:text-sm font-medium text-gray-900">
                                                                {formatNumberSimple(item.tiktok_user_followers)}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <span className="text-xs md:text-sm font-bold text-purple-700">
                                                                {item.first_no_videos === 0 ? (
                                                                    <span className="text-gray-400">-</span>
                                                                ) : (
                                                                    item.first_no_videos
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <span className="text-xs md:text-sm font-bold text-purple-700">
                                                                {item.first_views_total === 0 ? (
                                                                    <span className="text-gray-400">-</span>
                                                                ) : (
                                                                    formatNumberSimple(item.first_views_total)
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <span className="text-xs md:text-sm font-bold text-purple-700">
                                                                {item.first_likes_total === 0 ? (
                                                                    <span className="text-gray-400">-</span>
                                                                ) : (
                                                                    formatNumberSimple(item.first_likes_total)
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <span className="text-xs md:text-sm font-bold text-blue-700">
                                                                {item.second_no_videos === 0 ? (
                                                                    <span className="text-gray-400">-</span>
                                                                ) : (
                                                                    item.second_no_videos
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <span className="text-xs md:text-sm font-bold text-blue-700">
                                                                {item.second_views_total === 0 ? (
                                                                    <span className="text-gray-400">-</span>
                                                                ) : (
                                                                    formatNumberSimple(item.second_views_total)
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 md:py-3 px-2 md:px-4">
                                                            <span className="text-xs md:text-sm font-bold text-blue-700">
                                                                {item.second_likes_total === 0 ? (
                                                                    <span className="text-gray-400">-</span>
                                                                ) : (
                                                                    formatNumberSimple(item.second_likes_total)
                                                                )}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </TabsContent>

                            {/* GRÁFICOS */}
                            <TabsContent value="charts" className="h-full m-0">
                                {loading ? (
                                    <div className="h-full flex items-center justify-center">
                                        <CircularProgress size={isMobile ? 32 : 40} />
                                    </div>
                                ) : chartData.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-xs md:text-sm text-gray-600">
                                            No hay datos para mostrar
                                        </p>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col">
                                        <div className="flex-1 min-h-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={chartData}
                                                    layout={isMobile ? "vertical" : "horizontal"}
                                                    margin={isMobile ?
                                                        { left: 20, right: 20, top: 10, bottom: 10 } :
                                                        { left: 40, right: 40, top: 20, bottom: 20 }
                                                    }
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    {isMobile ? (
                                                        <>
                                                            <XAxis type="number" tick={{ fontSize: 10 }} />
                                                            <YAxis
                                                                type="category"
                                                                dataKey="name"
                                                                tick={{ fontSize: 10 }}
                                                                width={80}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XAxis
                                                                dataKey="name"
                                                                tick={{ fontSize: 11 }}
                                                                angle={-45}
                                                                textAnchor="end"
                                                                height={60}
                                                            />
                                                            <YAxis tick={{ fontSize: 11 }} />
                                                        </>
                                                    )}
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'rgba(255,255,255,0.95)',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: isMobile ? '10px' : '12px',
                                                            padding: isMobile ? '8px' : '12px',
                                                        }}
                                                        formatter={(value: number) => {
                                                            if (value === 0) return <span className="text-gray-400">-</span>;
                                                            return formatNumber(value);
                                                        }}
                                                        labelFormatter={(label) => `Ciudad: ${label}`}
                                                    />
                                                    <Legend
                                                        wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }}
                                                    />
                                                    <Bar
                                                        dataKey={song1.song.substring(0, 15)}
                                                        fill="#8b5cf6"
                                                        radius={[4, 4, 0, 0]}
                                                    >
                                                        {chartData.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={entry.winner === 'song1' ? '#8b5cf6' : '#c4b5fd'}
                                                            />
                                                        ))}
                                                    </Bar>
                                                    <Bar
                                                        dataKey={song2.song.substring(0, 15)}
                                                        fill="#3b82f6"
                                                        radius={[4, 4, 0, 0]}
                                                    >
                                                        {chartData.map((entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={entry.winner === 'song2' ? '#3b82f6' : '#93c5fd'}
                                                            />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="mt-2 md:mt-4 text-center">
                                            <p className="text-[10px] md:text-xs text-gray-500">
                                                * Mostrando las {isMobile ? '5' : '10'} ciudades con mayor diferencia
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>

                    {!isMobile && (
                        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="mr-3"
                            >
                                Cerrar
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Backdrop open={loading || loadingPlaylists || loadingTiktoks} sx={{ color: '#fff', zIndex: 99999 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    );
}