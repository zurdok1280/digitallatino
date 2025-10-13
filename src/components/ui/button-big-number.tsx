import { useDensityStyles } from "@/hooks/useDensityStyles";
import { styled, Tooltip } from "@mui/material";
import { Star } from "lucide-react";


interface BtnBigNumberProps {
    name: string;
    label?: string;
    quantity: number;
}

const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toLocaleString();
};

export function ButtonBigNumber({ name, quantity }: BtnBigNumberProps) {
    const { getSizeClass, text, dimensions } = useDensityStyles();
    const formattedNumber = formatNumber(quantity);
    const fullNumber = quantity.toLocaleString();

    return (
        <div className={`flex-shrink-0 relative bg-white/80 backdrop-blur-sm border border-white/60 rounded-lg shadow-sm group-hover:shadow-md group-hover:bg-white/90 transition-all ${getSizeClass('p-2', 'p-1.5')
            } ${dimensions.card}`}>
            <div className={`flex items-center justify-between ${getSizeClass('mb-1', 'mb-0.5')
                }`}>
                <div className="flex items-center gap-1">
                    <div className={`bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse ${getSizeClass('w-1.5 h-1.5', 'w-1 h-1')
                        }`}></div>
                    <span className={`font-semibold text-slate-600 uppercase tracking-wide ${text.small
                        }`}>
                        {name}
                    </span>
                </div>
                <Star className={`text-yellow-500 fill-current ${getSizeClass('w-2.5 h-2.5', 'w-2 h-2')
                    }`} />
            </div>
            <div className="flex items-center justify-between">
                <Tooltip title={fullNumber} arrow placement="top">
                    <div className={`font-bold bg-gradient-to-br from-slate-800 to-gray-900 bg-clip-text text-transparent cursor-help ${text.number
                        }`}>
                        {formattedNumber}
                    </div>
                </Tooltip>
            </div>
        </div>
    );
}