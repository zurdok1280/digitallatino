import React, { useState, useEffect } from 'react';
import { Play, Pause, Star, X, ChevronDown, Search, Users } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Country, digitalLatinoApi } from '@/lib/api';
import Portal from './Portal';
import WorldMapArtist from './buttoninfoArtist-components/worldMapArtist';

import BoxListenersArtist from './buttoninfoArtist-components/boxListenersArtist';
import { ExpandRowArtist } from './buttoninfoArtist-components/expandRowArtist';
import { DataPlatformArtist } from './buttoninfoArtist-components/dataPlatformArtist';


interface ArtistDetails {
    spotifyid?: string;
    artist: string;
    img?: string;
    rk?: number;
    score?: number;
    Id?: number;
    fk_artist?: number;
    playlist_reach?: number;
    popularity?: number;
    followers_total?: number;
    streams_total?: number;
    playlists?: number;
    monthly_listeners?: number;
    videos_total_tiktok?: number;
    followers_total_tiktok?: number;
    likes_total_tiktok?: number;
    comments_total_tiktok?: number;
    shares_total_tiktok?: number;
    views_total_tiktok?: number;
    engagement_rate_tiktok?: number;
    subscribers_total_youtube?: number;
    videos_total_youtube?: number;
    video_views_total_youtube?: number;
    video_likes_total_youtube?: number;
    shorts_total_youtube?: number;
    short_views_total_youtube?: number;
    engagement_rate_youtube?: number;
    followers_total_twitter?: number;
    followers_total_facebook?: number;
    followers_total_instagram?: number;
}

interface ChartArtistDetailsProps {
    artist: ArtistDetails;
    selectedCountry?: string;
    countries?: Country[];
    isOpen: boolean;
    onClose: () => void;
}

const ChartArtistDetails: React.FC<ChartArtistDetailsProps> = ({
    artist,
    selectedCountry: initialSelectedCountry = "1",
    countries: initialCountries = [],
    isOpen,
    onClose
}) => {
    const [countries, setCountries] = useState<Country[]>(initialCountries);
    const [selectedCountry, setSelectedCountry] = useState<string>("1");
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [dropdownSearch, setDropdownSearch] = useState("");
    const [artistInfo, setArtistInfo] = useState<ArtistDetails | null>(null);
    const [loadingArtistInfo, setLoadingArtistInfo] = useState(false);

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

    // Cargar información adicional del artista
    const loadArtistInfo = async () => {
        if (!artist.spotifyid) return;

        setLoadingArtistInfo(true);
        try {
            console.log('🔍 Cargando información adicional del artista:', artist.spotifyid);

            setArtistInfo(artist);
            console.log('✅ Información del artista cargada:', artist);

            const response = await digitalLatinoApi.getDataArtist(artist.spotifyid);
            setArtistInfo(response.data);

        } catch (error) {
            console.error('❌ Error cargando información del artista:', error);
        } finally {
            setLoadingArtistInfo(false);
        }
    };

    // Cargar países cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            loadCountries();
            loadArtistInfo();
        }
    }, [isOpen]);

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

    const formatNumber = (num: number | undefined): string => {
        if (!num || num === 0) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
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
                        className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white"
                        title="Cerrar detalles"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    {/* Header fijo */}
                    <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 p-4 md:p-6 text-white relative">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-4">
                            {/* Primera fila para móvil: Rank (si existe) + Artist Info */}
                            <div className={`col-span-1 ${artistInfo?.rk !== undefined ? 'md:col-span-7' : 'md:col-span-8'} flex items-center gap-4`}>
                                {/* Rank - Opcional para artistas */}
                                {artistInfo?.rk !== undefined && (
                                    <div className="flex-shrink-0">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
                                            <div className="relative bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-lg">
                                                <span className="text-xl md:text-2xl font-bold text-white">
                                                    {artistInfo?.rk ? `#${artistInfo.rk}` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Artist Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="relative flex-shrink-0">
                                            <Avatar className="relative h-16 w-16 md:h-20 md:w-20 rounded-xl shadow-lg border-2 border-white/30">
                                                <AvatarImage
                                                    src={artistInfo?.img || artist.img}
                                                    alt={artistInfo?.artist || artist.artist}
                                                    className="rounded-xl object-cover"
                                                />
                                                <AvatarFallback className="rounded-xl bg-white/20 text-white font-bold text-base md:text-lg">
                                                    <Users className="w-8 h-8 md:w-10 md:h-10" />
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h1 className="text-lg md:text-2xl font-bold text-white leading-tight mb-1 md:mb-2 line-clamp-1">
                                                {artistInfo?.artist || artist.artist || 'Artista no disponible'}
                                            </h1>

                                            {/* Estadísticas del artista */}
                                            <div className="flex flex-wrap gap-2 md:gap-4 mb-2 md:mb-3">
                                                {artistInfo?.followers_total && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm md:text-base text-white/90 font-semibold">
                                                            {formatNumber(artistInfo.followers_total)}
                                                        </span>
                                                        <span className="text-xs md:text-sm text-white/80">seguidores</span>
                                                    </div>
                                                )}
                                                {artistInfo?.monthly_listeners && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm md:text-base text-white/90 font-semibold">
                                                            {formatNumber(artistInfo.playlist_reach)}
                                                        </span>
                                                        <span className="text-xs md:text-sm text-white/80">apariciones</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Dropdown de países */}
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenDropdown(!openDropdown)}
                                                    className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white hover:bg-white/30 transition-all duration-200 flex items-center gap-1 md:gap-2 w-full md:min-w-[200px] max-w-[400px] text-left"
                                                    disabled={loadingCountries}
                                                >
                                                    <span className="flex-1 truncate">
                                                        {loadingCountries ? "Cargando países..." : getSelectedCountryName()}
                                                    </span>
                                                    <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
                                                </button>
                                                {openDropdown && (
                                                    <div className="absolute z-[9999] top-full left-0 mt-1 w-full md:min-w-[250px] max-w-[400px]">
                                                        <div className="bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-2xl max-h-60 overflow-hidden">
                                                            <div className="p-2 border-b border-white/20">
                                                                <div className="relative">
                                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Buscar país..."
                                                                        className="w-full pl-8 md:pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-lg text-xs md:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                                                                    className={`w-full px-4 py-2 md:py-3 text-left text-xs md:text-sm hover:bg-purple-50 transition-colors ${selectedCountry === "0"
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
                                                                        className={`w-full px-4 py-2 md:py-3 text-left text-xs md:text-sm hover:bg-purple-50 transition-colors ${selectedCountry === country.id.toString()
                                                                            ? "bg-purple-100 text-purple-700 font-semibold"
                                                                            : "text-gray-700"
                                                                            }`}
                                                                    >
                                                                        {country.country_name} ({country.country})
                                                                    </button>
                                                                ))}

                                                                {filteredCountries.length === 0 && (
                                                                    <div className="px-4 py-2 md:py-3 text-xs md:text-sm text-gray-500 text-center">
                                                                        No se encontraron países
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Segunda fila para móvil: Artist Score */}
                            <div className={`col-span-1 ${artistInfo?.rk !== undefined ? 'md:col-span-5' : 'md:col-span-4'} text-left md:text-right mt-4 md:mt-0`}>
                                <div className="relative bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-3 md:p-4 shadow-lg">
                                    <div className="flex items-center justify-between mb-1 md:mb-2">
                                        <div className="flex items-center gap-1 md:gap-2">
                                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
                                            <span className="text-xs font-bold text-white uppercase tracking-wide">
                                                Oyentes Mensuales
                                            </span>
                                        </div>
                                        <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-300 fill-current" />
                                    </div>
                                    <div className="text-2xl md:text-3xl font-black text-white">
                                        {formatNumber(artistInfo?.monthly_listeners) || 'N/A'}
                                    </div>
                                    <div className="text-xs text-white/80 mt-0.5 md:mt-1 line-clamp-1">
                                        {getSelectedCountryName()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenido scrollable */}
                    {artistInfo?.monthly_listeners && artistInfo?.monthly_listeners > 0 ? (
                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                                {/* Mapa de distribución por ciudades */}
                                {artist.spotifyid && (
                                    <WorldMapArtist
                                        countryId={parseInt(selectedCountry)}
                                        spotifyId={artist.spotifyid}
                                        title="📍 Distribución por Ciudades del Artista"
                                        height={400}
                                    />
                                )}

                                {/* Datos de plataformas del artista */}
                                <DataPlatformArtist
                                    spotifyId={artist.spotifyid || ""}
                                    artistName={artist.artist}
                                />

                                {/* Audiencia por ciudad */}
                                <BoxListenersArtist
                                    label="Audiencia por Ciudad"
                                    spotifyId={artist.spotifyid || ""}
                                    selectedCountryId={selectedCountry}
                                />

                                {/* Información expandida del artista */}
                                <ExpandRowArtist
                                    artist={artist}
                                    selectedCountry={selectedCountry}
                                    isExpanded={true}
                                />
                            </div>
                        </div>
                    ) : (
                        < div className="flex-1 flex flex-col items-center justify-center p-6 pb-52 pt-52 bg-gray-50">
                            <p className="text-gray-500 text-lg md:text-xl items-center text-center ">
                                Información no disponible en este momento.<br /> La estamos recopilando;
                                por favor regresa en aproximadamente
                            </p>
                            <p className="text-blue-500 text-lg md:text-xl">
                                2 horas.
                            </p>
                        </div>
                    )

                    }

                </div>
            </div>
        </Portal >
    );
};

export default ChartArtistDetails;