import BoxCampaign from './buttonInfoSong-components/boxCampaign';
import React, { useState, useEffect } from 'react';
import { Play, Pause, Star, X, ChevronDown, Search } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Song, Country, CityDataForSong, digitalLatinoApi, SongBasicInfo } from '@/lib/api';
import BoxElementsDisplay from './buttonInfoSong-components/boxElementsDisplay';
import BoxDisplayInfoPlatform from './buttonInfoSong-components/boxDisplayInfoPlatform';
import BoxPlaylistsDisplay from './buttonInfoSong-components/boxPlaylistsDisplay';
import BoxTikTokInfluencers from './buttonInfoSong-components/boxTikTokInfluencers';
import Portal from './Portal';
import BoxElementsDisplaySpins from './buttonInfoSong-components/boxElementsDisplaySpins';
import BoxElementsDisplayAudience from './buttonInfoSong-components/boxElemensDisplayAudience';

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
    selectedCountry: initialSelectedCountry = "1", // Cambiado a "1" por defecto
    selectedFormat = "0",
    countries: initialCountries = [],
    onPlayPreview,
    currentlyPlaying,
    isOpen,
    onClose
}) => {
    const [cityData, setCityData] = useState<CityDataForSong[]>([]);
    const [loadingCityData, setLoadingCityData] = useState(false);
    const [infoSong, setInfoSong] = useState<SongBasicInfo | null>(null);
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [countries, setCountries] = useState<Country[]>(initialCountries);
    const [selectedCountry, setSelectedCountry] = useState<string>("1"); // Cambiado a "1" por defecto
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [dropdownSearch, setDropdownSearch] = useState("");

    // Función helper para Portal del dropdown
    const DropdownPortal: React.FC<{ children: React.ReactNode; isOpen: boolean }> = ({ children, isOpen }) => {
        if (!isOpen) return null;

        return (
            <Portal>
                {children}
            </Portal>
        );
    };

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

    // Cargar países si no se pasaron como prop
    const loadCountries = async () => {
        if (initialCountries.length > 0) {
            setCountries(initialCountries);
            return;
        }

        try {
            setLoadingCountries(true);
            const response = await digitalLatinoApi.getCountries();
            setCountries(response.data);
        } catch (error) {
            console.error('❌ Error cargando países:', error);
        } finally {
            setLoadingCountries(false);
        }
    };

    // Cargar datos de ciudades directamente
    const loadCityData = async () => {
        if (!song.cs_song) return;

        setLoadingCityData(true);
        try {
            console.log('🔍 Cargando datos de ciudades para cs_song:', song.cs_song);

            // Usar el countryId seleccionado
            const countryId = parseInt(selectedCountry);

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

    // Cargar información adicional de la canción
    const loadInfoSong = async () => {
        if (!song.cs_song) return;
        setLoadingInfo(true);

        try {
            console.log('🔍 Cargando información adicional de la canción:', song.cs_song);

            // Usar el countryId seleccionado
            const countryId = parseInt(selectedCountry);

            const response = await digitalLatinoApi.getRankSongByIdCountry(song.cs_song, countryId);
            console.log('📊 Respuesta de getRankSongByIdCountry:', response);

            if (response.data) {
                setInfoSong(response.data);
                console.log('✅ Información adicional cargada:', response.data);
            }
        } catch (error) {
            console.error('❌ Error cargando información adicional:', error);
        } finally {
            setLoadingInfo(false);
        }
    };

    // Cargar países cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            loadCountries();
        }
    }, [isOpen]);

    // Cargar datos cuando cambia el país seleccionado o se abre el modal
    useEffect(() => {
        if (isOpen && song.cs_song) {
            console.log('🎯 Cargando datos con selectedCountry:', selectedCountry);
            loadCityData();
            loadInfoSong();
        }
    }, [isOpen, song.cs_song, selectedCountry]);

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

    const handleCountrySelect = (countryId: string) => {
        setSelectedCountry(countryId);
        setOpenDropdown(false);
        setDropdownSearch("");
    };

    // Filtrar países basado en la búsqueda
    const filteredCountries = dropdownSearch.trim()
        ? countries.filter(country =>
            country.country_name?.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
            country.country?.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
            country.description?.toLowerCase().includes(dropdownSearch.toLowerCase())
        )
        : countries;

    // Obtener el nombre del país seleccionado
    const getSelectedCountryName = () => {
        if (selectedCountry === "0") return "🌎 Todos los países";
        const country = countries.find(c => c.id.toString() === selectedCountry);
        return country ? `${country.country_name} (${country.country})` : "Seleccionar país";
    };

    // Cerrar dropdown con Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && openDropdown) {
                setOpenDropdown(false);
                setDropdownSearch("");
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [openDropdown]);

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
                                            {loadingInfo ? '...' : `#${infoSong?.rk || song.rk || 0}`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Track Info */}
                            <div className="col-span-7 flex items-center gap-4">
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

                                    {/* Dropdown de países */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setOpenDropdown(!openDropdown)}
                                            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition-all duration-200 flex items-center gap-2 min-w-[200px] text-left"
                                            disabled={loadingCountries}
                                        >
                                            <span className="flex-1 truncate">
                                                {loadingCountries ? "Cargando países..." : getSelectedCountryName()}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
                                        </button>

                                        <DropdownPortal isOpen={openDropdown}>
                                            <div
                                                className="fixed bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-2xl max-h-60 overflow-hidden z-[9999]"
                                                style={{
                                                    position: 'fixed',
                                                    top: '140px', // Ajusta según la posición de tu header
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    width: '250px',
                                                    zIndex: 9999
                                                }}
                                            >
                                                <div className="p-2 border-b border-white/20">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Buscar país..."
                                                            className="w-full pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                                            value={dropdownSearch}
                                                            onChange={(e) => setDropdownSearch(e.target.value)}
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>

                                                <div className="max-h-48 overflow-y-auto">
                                                    {/* Opción "Todos los países" */}
                                                    <button
                                                        onClick={() => handleCountrySelect("0")}
                                                        className={`w-full px-4 py-3 text-left text-sm hover:bg-purple-50 transition-colors ${selectedCountry === "0"
                                                            ? "bg-purple-100 text-purple-700 font-semibold"
                                                            : "text-gray-700"
                                                            }`}
                                                    >
                                                        🌎 Todos los países
                                                    </button>

                                                    {filteredCountries.map((country) => (
                                                        <button
                                                            key={country.id}
                                                            onClick={() => handleCountrySelect(country.id.toString())}
                                                            className={`w-full px-4 py-3 text-left text-sm hover:bg-purple-50 transition-colors ${selectedCountry === country.id.toString()
                                                                ? "bg-purple-100 text-purple-700 font-semibold"
                                                                : "text-gray-700"
                                                                }`}
                                                        >
                                                            {country.country_name} ({country.country})
                                                        </button>
                                                    ))}

                                                    {filteredCountries.length === 0 && (
                                                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                            No se encontraron países
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </DropdownPortal>
                                    </div>
                                </div>
                            </div>

                            {/* Digital Score */}
                            <div className="col-span-4 text-right">
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
                                        {loadingInfo ? '...' : (infoSong?.score || song.score || 0)}
                                    </div>
                                    <div className="text-xs text-white/80 mt-1">
                                        {getSelectedCountryName()}
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
                                songName={song.song}
                                artistName={song.artists}
                            />

                            {/* Top de ciudades */}
                            <BoxElementsDisplay
                                label={"Top Cities Digital"}
                                csSong={song.cs_song.toString()}
                                selectedCountryId={selectedCountry}
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

                            {/* Top Mercados en Radio - solo mostrar si no es "Todos los países" */}
                            {selectedCountry !== "0" && (
                                <BoxElementsDisplaySpins
                                    csSong={song.cs_song}
                                    countryId={parseInt(selectedCountry)}
                                    title="Top Mercados en Radio"
                                    label="mercados"
                                    type="markets"
                                />
                            )}

                            {/* Estadísticas de Radio */}
                            <BoxElementsDisplayAudience
                                csSong={song.cs_song}
                                title="Top Países en Radio"
                                label="países"
                                type="countries"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default ChartSongDetails;