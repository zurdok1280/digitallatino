import React, { useEffect, useState } from 'react';
import { BarChart3, Check, X, ChevronRight, SquareArrowLeft, } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { createPortal } from 'react-dom';

interface ComparisonModeProps {
    isActive: boolean;
    onToggle: () => void;
    selectedCount: number;
    onCompare: () => void;
    onClear: () => void;
}

export function ComparisonMode({
    isActive,
    onToggle,
    selectedCount,
    onCompare,
    onClear,
}: ComparisonModeProps) {
    const { toast } = useToast();
    const [isHovered, setIsHovered] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleCompareClick = () => {
        if (selectedCount === 2) {
            onCompare();
        } else {
            toast({
                title: 'Selecciona 2 canciones',
                description: `Actualmente tienes ${selectedCount} seleccionadas. Necesitas exactamente 2 para comparar.`,
                variant: 'destructive',
            });
        }
    };

    return (
        <div
            className="fixed top-1 left-2 z-50"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                onClick={onToggle}
                className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg cursor-pointer
          transition-all duration-300 transform hover:scale-105
          ${!isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                    }
        `}
            >
                {!isActive ? (
                    <BarChart3 className="w-4 h-4 text-white" />
                ) : (
                    <SquareArrowLeft className="w-4 h-4 text-white" />
                )}
                <span
                    className={`
            text-xs font-medium text-white overflow-hidden transition-all duration-300
            ${isHovered ? 'max-w-[120px] opacity-100 ml-1' : 'max-w-0 opacity-0'}
          `}
                >
                    {!isActive ? 'Comparar' : 'Regresar'}
                </span>
            </div>

            {/* Tooltip informativo */}
            {isHovered && !isActive && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-purple-100 px-3 py-2 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                        <span className="text-xs font-medium text-gray-700">
                            Comparar 2 canciones
                        </span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                        Selecciona los tracks que quieras comparar
                    </div>
                </div>
            )}

            {isActive && selectedCount === 0 && isHovered && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-red-100 px-3 py-2 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span className="text-xs font-medium text-gray-700">
                            Modo comparación activo
                        </span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                        Haz click en los checkboxes para seleccionar
                    </div>
                </div>
            )}

            {/* Contador flotante - SIN FILTRO DE CIUDADES, solo muestra el contador en el orden original */}
            {mounted && isActive && selectedCount > 0 && createPortal(
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[99999]">
                    <div className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-purple-200 px-4 py-2 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                {selectedCount}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                {selectedCount === 2 ? '2/2 seleccionadas' : `${selectedCount}/2 seleccionadas`}
                            </span>
                        </div>

                        <div className="w-px h-5 bg-gray-200" />

                        <div className="flex gap-1.5">
                            <button
                                onClick={onClear}
                                className="text-xs px-2.5 py-1.5 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Limpiar
                            </button>
                            <button
                                onClick={handleCompareClick}
                                disabled={selectedCount !== 2}
                                className={`
                  text-xs px-3 py-1.5 rounded-full font-medium transition-all
                  ${selectedCount === 2
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }
                `}
                            >
                                Comparar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}