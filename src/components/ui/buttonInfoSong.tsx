import { Country, Song } from "@/lib/api";
import { ChevronUp, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BoxElementsDisplay from "./buttonInfoSong-components/boxElementsDisplay";
import BoxDisplayInfoPlatform from "./buttonInfoSong-components/boxDisplayInfoPlatform";


export interface ButtonInfoSongProps {
    index: number;
    row: Song;
    selectedCountry?: string;
}

// Componente para la fila expandida
interface ExpandRowProps {
    row: Song;
    onPromote: () => void;
    selectedCountry?: string;
    selectedFormat?: string
    countries?: Country[];
}

export function ExpandRow({ row, onPromote, selectedCountry, selectedFormat, countries, isExpanded }: ExpandRowProps & { countries: Country[]; isExpanded: boolean; }) {
    const [cityData, setCityData] = useState<any[]>([]);

    const [expansionTrigger, setExpansionTrigger] = useState(0);

    const handleCityDataLoaded = (data: any[]) => {
        setCityData(data);
    };
    useEffect(() => {
        if (isExpanded) {
            setExpansionTrigger(prev => prev + 1);
        }
    }, [isExpanded]);

    return (
        <div className="border-t border-white/30 pt-4 bg-background/50 rounded-lg p-4 animate-fade-in">
            {/* Top de ciudades */}
            <BoxElementsDisplay
                label={"Top Cities Digital"}
                csSong={row.cs_song.toString()}
                countries={countries} // Pasar la lista de países del componente padre
                onDataLoaded={handleCityDataLoaded}
            />

            {/* Estadísticas de Plataformas */}
            <BoxDisplayInfoPlatform
                key={`platform-${row.cs_song}-${selectedFormat}`}
                csSong={row.cs_song}
                formatId={selectedFormat ? parseInt(selectedFormat) : 0}
                triggerReload={expansionTrigger}
            />
            {/* Top Markets - Horizontal compact display */}
            <div className="mb-4 bg-black border border-green-500/30 rounded-xl p-3">
                <div className="text-xs text-green-400 font-bold mb-2 uppercase tracking-wide">Top Markets Performance</div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
                    {/* {row.topCountries?.slice(0, 5).map((country, index) => (
                        <div key={country} className="flex justify-between items-center bg-white/5 rounded p-2">
                            <span className="text-gray-400">{index === 0 ? '🇺🇸' : index === 1 ? '🇲🇽' : index === 2 ? '🇨🇴' : index === 3 ? '🇦🇷' : '🇨🇱'} {country.split(' ')[0]}</span>
                            <span className="text-green-400 font-bold">{34 - (index * 6)}%</span>
                        </div>
                    ))} */}
                </div>
            </div>

            {/* Detailed Analytics Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-black border border-green-500/30 rounded-xl p-3">
                    <div className="text-xs text-green-400 font-bold mb-2 uppercase tracking-wide">Revenue Analytics</div>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Total Streams:</span>
                            <span className="text-white font-bold">2.4M</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Revenue:</span>
                            <span className="text-green-400 font-bold">$8,420</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">RPM:</span>
                            <span className="text-white font-bold">$3.51</span>
                        </div>
                    </div>
                </div>

                <div className="bg-black border border-green-500/30 rounded-xl p-3">
                    <div className="text-xs text-green-400 font-bold mb-2 uppercase tracking-wide">Growth Metrics</div>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Weekly Growth:</span>
                            <span className="text-green-400 font-bold">+234%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">New Listeners:</span>
                            <span className="text-white font-bold">45.2K</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Retention:</span>
                            <span className="text-white font-bold">68%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-black border border-green-500/30 rounded-xl p-3">
                    <div className="text-xs text-green-400 font-bold mb-2 uppercase tracking-wide">Demographic Data</div>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Age 18-24:</span>
                            <span className="text-white font-bold">42%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Age 25-34:</span>
                            <span className="text-white font-bold">35%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Male/Female:</span>
                            <span className="text-white font-bold">48/52</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Componente que solo maneja el botón
export function ButtonInfoSong({ index, row, isExpanded, onToggle, selectedCountry }: ButtonInfoSongProps & {
    isExpanded: boolean;
    onToggle: (index: number) => void;
    selectedCountry: string;
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