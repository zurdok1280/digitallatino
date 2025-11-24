import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ButtonInfoArtistProps {
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
}

export function ButtonInfoArtist({ index, isExpanded, onToggle }: ButtonInfoArtistProps) {
    return (
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
    );
}