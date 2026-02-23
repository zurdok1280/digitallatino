import React, { useState, useEffect } from 'react';
import { X, BarChart3, MapPin, TrendingUp, TrendingDown, Music, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { digitalLatinoApi, VsSongData, SelectedSong } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Backdrop, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface SongCompareProps {
    isOpen: boolean;
    onClose: () => void;
    song1: SelectedSong;
    song2: SelectedSong;
}

export function SongCompare({ isOpen, onClose, song1, song2 }: SongCompareProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState<VsSongData[]>([]);
    const [activeTab, setActiveTab] = useState('table');
    const [sortConfig, setSortConfig] = useState<{
        key: keyof VsSongData | 'winner';
        direction: 'asc' | 'desc';
    }>({ key: 'dif_streams', direction: 'desc' });
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
        }
    }, [isOpen, song1, song2]);

    const fetchComparisonData = async () => {
        try {
            setLoading(true);
            const response = await digitalLatinoApi.getVsSongs(song1.cs_song, song2.cs_song);
            setComparisonData(response.data);
            setCurrentPage(1); // Resetear página cuando cargan nuevos datos
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

    // Ordenar datos
    const sortedData = [...comparisonData].sort((a, b) => {
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
        return 0;
    });

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

    const requestSort = (key: keyof VsSongData | 'winner') => {
        setSortConfig(prev => ({
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

    const formatDifference = (num: number) => {
        if (num === 0) return <span className="text-gray-400">-</span>;
        const formatted = num > 0 ? `+${num.toLocaleString()}` : num.toLocaleString();
        return formatted;
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-md flex items-center justify-center p-2 md:p-4 overflow-hidden"
                onClick={(e) => {
                    // Cerrar si se hace click en el backdrop
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
                                    <p className="text-sm text-gray-600">Análisis detallado por ciudad</p>
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
                  flex items-center justify-center text-white font-bold flex-shrink-0
                  ${isMobile ? 'w-12 h-12 text-xs' : 'w-16 h-16'}
                `}>
                                    {song1.avatar ? (
                                        <img src={song1.spotifyid} alt={song1.song} className="w-full h-full rounded-lg object-cover" />
                                    ) : (
                                        song1.song.substring(0, 2).toUpperCase()
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
                  flex items-center justify-center text-white font-bold flex-shrink-0
                  ${isMobile ? 'w-12 h-12 text-xs' : 'w-16 h-16'}
                `}>
                                    {song2.avatar ? (
                                        <img src={song2.spotifyid} alt={song2.song} className="w-full h-full rounded-lg object-cover" />
                                    ) : (
                                        song2.song.substring(0, 2).toUpperCase()
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

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                        <div className={`
              border-b border-gray-200 mb-3
              ${isMobile ? 'overflow-x-auto pb-1' : ''}
            `}>
                            <TabsList className={`
                ${isMobile ? 'inline-flex w-auto' : 'grid w-full grid-cols-2'}
              `}>
                                <TabsTrigger value="table" className={isMobile ? 'px-4 py-1.5 text-xs' : ''}>
                                    📊 Tabla
                                </TabsTrigger>
                                <TabsTrigger value="charts" className={isMobile ? 'px-4 py-1.5 text-xs' : ''}>
                                    📈 Gráficos
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Contenido de tabs */}
                        <div className="flex-1 overflow-auto min-h-0">
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
                                                                {sortConfig.key === 'city_name' && (
                                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                                )}
                                                            </div>
                                                        </th>
                                                        <th
                                                            className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                            onClick={() => requestSort('first_streams')}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                {song1.song.substring(0, 8)}
                                                                {sortConfig.key === 'first_streams' && (
                                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                                )}
                                                            </div>
                                                        </th>
                                                        <th
                                                            className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                            onClick={() => requestSort('second_streams')}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                {song2.song.substring(0, 8)}
                                                                {sortConfig.key === 'second_streams' && (
                                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                                )}
                                                            </div>
                                                        </th>
                                                        <th
                                                            className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                            onClick={() => requestSort('dif_streams')}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                Diferencia
                                                                {sortConfig.key === 'dif_streams' && (
                                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                                )}
                                                            </div>
                                                        </th>
                                                        <th
                                                            className="py-2 md:py-3 px-2 md:px-4 text-left text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                            onClick={() => requestSort('winner')}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                Ganador
                                                                {sortConfig.key === 'winner' && (
                                                                    <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                                )}
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

            <Backdrop open={loading} sx={{ color: '#fff', zIndex: 99999 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    );
}