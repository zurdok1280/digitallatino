import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandRowArtist } from "./buttoninfoArtist-components/expandRowArtist";
import { DataPlatformArtist } from "./buttoninfoArtist-components/dataPlatformArtist";
import BoxListenersArtist from "./buttoninfoArtist-components/boxListenersArtist";

interface ButtonInfoArtistProps {
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    artist: {
        spotifyid?: string;
        artist: string;
        rk: number;
        img?: string;
        followers_total?: number;
        monthly_listeners?: number;
    };
    selectedCountry: string;
}

export function ButtonInfoArtist({
    index,
    isExpanded,
    onToggle,
    artist,
    selectedCountry
}: ButtonInfoArtistProps) {
    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0 hover:bg-slate-100 transition-colors"
            >
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-600" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-slate-600" />
                )}
            </Button>
        </>
    );
}

// Hook para manejar filas expandibles (similar al de buttonInfoSong)
export function useExpandableRows() {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRow = (index: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const isExpanded = (index: number) => expandedRows.has(index);

    return { expandedRows, toggleRow, isExpanded };
}

// Componente ExpandRow para artistas 
interface ExpandRowProps {
    artist: {
        spotifyid?: string;
        artist: string;
        rk: number;
        img?: string;
    };
    selectedCountry: string;
    isExpanded?: boolean;
}

export function ExpandRow({ artist, selectedCountry, isExpanded }: ExpandRowProps) {
    return (
        <div className="mt-4 animate-in fade-in duration-300">
            <DataPlatformArtist
                spotifyId={artist.spotifyid || ""}
                artistName={artist.artist}
            />
            <BoxListenersArtist
                label="Audiencia por Ciudad"
                spotifyId={artist.spotifyid || ""}
                selectedCountryId={selectedCountry}
            />
            <ExpandRowArtist
                artist={artist}
                selectedCountry={selectedCountry}
                isExpanded={isExpanded}
            />

        </div>
    );
}