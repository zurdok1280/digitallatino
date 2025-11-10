import React from 'react';

interface LabelTooltipProps {
    label: string;
    isVisible: boolean;
    position: { x: number; y: number };
}

export const LabelTooltip: React.FC<LabelTooltipProps> = ({ isVisible, position, label }) => {
    if (!isVisible) return null;

    return (
        <div
            className="fixed bg-white text-gray-800 text-xs rounded-lg py-2 px-3 shadow-2xl border border-gray-200 whitespace-normal w-48 z-[99999]"
            style={{
                left: position.x,
                top: position.y - 50,
            }}
        >
            {label}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-white"></div>
        </div>
    );
};