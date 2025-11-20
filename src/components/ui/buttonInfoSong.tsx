import { CityDataForSong, Country, Song, TopTrendingPlatforms } from "@/lib/api";
import { ChevronUp, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BoxElementsDisplay from "./buttonInfoSong-components/boxElementsDisplay";
import BoxDisplayInfoPlatform from "./buttonInfoSong-components/boxDisplayInfoPlatform";
import BoxPlaylistsDisplay from "./buttonInfoSong-components/boxPlaylistsDisplay";
import BoxCampaign from "./buttonInfoSong-components/boxCampaign";
import BoxTikTokInfluencers from "./buttonInfoSong-components/boxTikTokInfluencers";


export interface ButtonInfoSongProps {
    index: number;
    row: Song | TopTrendingPlatforms;
    selectedCountry?: string;
    isExpanded: boolean;
    onToggle: (index: number) => void;
}

// Componente para la fila expandida
interface ExpandRowProps {
    row?: Song;
    onPromote: () => void;
    selectedCountry?: string;
    selectedFormat?: string;
    countries?: Country[];
    isExpanded?: boolean;
    cityDataForSong?: CityDataForSong[];
    loadingCityData?: boolean;
}

export function ExpandRow({
    row,
    onPromote,
    selectedCountry,
    selectedFormat,
    countries,
    isExpanded,
    cityDataForSong,
    loadingCityData
}: ExpandRowProps) {
    const [cityData, setCityData] = useState<any[]>([]);
    const [loadTimestamp, setLoadTimestamp] = useState(Date.now());

    const handleCityDataLoaded = (data: any[]) => {
        setCityData(data);
    };
    console.log('🔵 ExpandRow rendering with:', {
        csSong: row.cs_song,
        selectedFormat,
        hasRow: !!row
    });

    // Resetear timestamp cuando se expande
    useEffect(() => {
        if (isExpanded) {
            setLoadTimestamp(Date.now());
        }
    }, [isExpanded]);



    return (
        <div className="border-t border-white/30 pt-4 bg-background/50 rounded-lg p-4 animate-fade-in">
            {/* Información campaña */}
            <BoxCampaign
                spotifyId={row.spotifyid}
                csSong={row.cs_song}
                songName={row.song}
                artistName={row.artists}
            />

            {/* Top de ciudades */}
            <BoxElementsDisplay
                label={"Top Ciudades Digital"}
                csSong={row.cs_song.toString()}
                countries={countries} // Pasar la lista de países del componente padre
                onDataLoaded={handleCityDataLoaded}
            />

            {/* Estadísticas de Plataformas */}
            <BoxDisplayInfoPlatform
                csSong={row.cs_song}
                formatId={selectedFormat ? parseInt(selectedFormat) : 0}

            />

            {/* Playlist Info */}
            <BoxPlaylistsDisplay csSong={row.cs_song} />

            {/* TikTok Influencers */}
            <BoxTikTokInfluencers csSong={row.cs_song} />
        </div>
    );
}

// Componente que solo maneja el botón
export function ButtonInfoSong({
    index,
    row,
    selectedCountry,
    isExpanded,
    onToggle
}: ButtonInfoSongProps & {
    isExpanded: boolean;
    onToggle: (index: number) => void;
}) {
    return (
        <button
            onClick={() => onToggle(index)}
            className="bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-white/50 text-slate-600 p-1 rounded-lg text-xs transition-all duration-200 hover:scale-105 shadow-sm ml-2"
        >
            {isExpanded ? (
                <ChevronUp className="w-3 h-3" />
            ) : (
                <Plus className="w-3 h-3" />
            )}
        </button>
    );
}

// Hook personalizado para manejar el estado de expansión
export function useExpandableRows() {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRow = (index: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedRows(newExpanded);
    };

    const isExpanded = (index: number) => expandedRows.has(index);

    return { expandedRows, toggleRow, isExpanded };
}