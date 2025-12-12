import { styled, Tooltip } from "@mui/material";
import { Star } from "lucide-react";

interface BtnBigNumberProps {
    name: string;
    label?: string;
    quantity: number;
}

// Tooltip personalizado con alineación a la izquierda y dimensiones mínimas
const CustomTooltip = styled(Tooltip)(({ theme }) => ({
    tooltip: {
        backgroundColor: '#ffffff',
        color: '#374151',
        fontSize: '12px',
        fontWeight: '600',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        borderRadius: '8px',
        padding: '8px 12px',
        minWidth: '80px',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        textAlign: 'left'
    },
    arrow: {
        color: '#ffffff',
        '&:before': {
            border: '1px solid #e5e7eb',
        }
    },
}));

// Función para formatear los números
const formatNumber = (num: number): string => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + ' M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + ' K';
    }
    return num.toLocaleString();
};

export function ButtonBigNumber(btnBigNumberProps: BtnBigNumberProps) {
    return (
        <>
            <div className="flex-shrink-0">
                <div className=""> {/* relative bg-white/80 backdrop-blur-sm border border-white/60 rounded-xl p-2.5 shadow-sm group-hover:shadow-md group-hover:bg-white/90 transition-all duration-300 min-w-[90px] */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-semibold text-slate-600 tracking-wide"> {btnBigNumberProps.name} </span>
                        </div>
                        {/*<Star className="w-2.5 h-2.5 text-yellow-500 fill-current" />*/}
                    </div>
                    <div className="flex items-end justify-between">
                        <CustomTooltip
                            title={
                                <div style={{
                                    textAlign: 'left',
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'flex-start'
                                }}>
                                    {btnBigNumberProps.quantity.toLocaleString()}
                                </div>
                            }
                            arrow
                            placement="top-start"
                        >
                            <div className="text-lg text-right font-bold bg-gradient-to-br from-slate-800 to-gray-900 bg-clip-text text-transparent cursor-help hover:opacity-80 transition-opacity">
                                {formatNumber(btnBigNumberProps.quantity)}
                            </div>
                        </CustomTooltip>
                    </div>
                </div>
            </div>
        </>
    );
}