import React from 'react';

export const LatinAmericaMap = () => {
  return (
    <div className="w-full h-32 bg-gradient-to-br from-green-100 via-yellow-50 to-blue-100 rounded-md border border-gray-200 relative overflow-hidden">
      <svg 
        viewBox="0 0 400 300" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* México */}
        <path 
          d="M50 80 L120 75 L140 85 L130 100 L100 105 L80 95 L50 80" 
          fill="#3b82f6" 
          opacity="0.7"
          className="hover:opacity-90 transition-opacity"
        />
        
        {/* América Central */}
        <path 
          d="M120 105 L140 100 L145 110 L140 115 L125 115 L120 105" 
          fill="#10b981" 
          opacity="0.7"
          className="hover:opacity-90 transition-opacity"
        />
        
        {/* Colombia */}
        <path 
          d="M140 115 L160 120 L165 135 L155 145 L145 140 L140 125 L140 115" 
          fill="#f59e0b" 
          opacity="0.7"
          className="hover:opacity-90 transition-opacity"
        />
        
        {/* Venezuela */}
        <path 
          d="M165 120 L185 115 L190 130 L180 135 L165 135 L165 120" 
          fill="#ef4444" 
          opacity="0.7"
          className="hover:opacity-90 transition-opacity"
        />
        
        {/* Brasil */}
        <path 
          d="M180 135 L240 140 L250 180 L240 220 L200 225 L180 200 L175 170 L180 135" 
          fill="#8b5cf6" 
          opacity="0.7"
          className="hover:opacity-90 transition-opacity"
        />
        
        {/* Argentina */}
        <path 
          d="M160 200 L200 205 L210 240 L200 270 L180 275 L170 250 L160 220 L160 200" 
          fill="#06b6d4" 
          opacity="0.7"
          className="hover:opacity-90 transition-opacity"
        />
        
        {/* Chile */}
        <path 
          d="M150 210 L160 215 L155 270 L145 275 L140 220 L150 210" 
          fill="#f97316" 
          opacity="0.7"
          className="hover:opacity-90 transition-opacity"
        />
        
        {/* Perú */}
        <path 
          d="M140 160 L160 155 L165 185 L155 200 L145 195 L140 175 L140 160" 
          fill="#84cc16" 
          opacity="0.7"
          className="hover:opacity-90 transition-opacity"
        />
        
        {/* Ecuador */}
        <path 
          d="M140 140 L155 145 L160 155 L150 160 L140 155 L140 140" 
          fill="#ec4899" 
          opacity="0.7"
          className="hover:opacity-90 transition-opacity"
        />
        
        {/* Heat dots representing major cities */}
        <circle cx="90" cy="90" r="3" fill="#ff0000" opacity="0.8" />
        <circle cx="180" cy="125" r="2.5" fill="#ff4400" opacity="0.7" />
        <circle cx="200" cy="160" r="4" fill="#ff0000" opacity="0.9" />
        <circle cx="175" cy="210" r="3.5" fill="#ff2200" opacity="0.8" />
        <circle cx="155" cy="240" r="2.8" fill="#ff6600" opacity="0.7" />
        <circle cx="120" cy="100" r="2" fill="#ff8800" opacity="0.6" />
        
        {/* Gradient overlay for heat effect */}
        <defs>
          <radialGradient id="heatGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff0000" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#ff4400" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffaa00" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        
        <rect x="0" y="0" width="400" height="300" fill="url(#heatGradient)" />
        
        {/* Labels for major cities */}
        <text x="90" y="105" fontSize="8" fill="#1f2937" fontWeight="bold" textAnchor="middle">
          Ciudad de México
        </text>
        <text x="200" y="175" fontSize="8" fill="#1f2937" fontWeight="bold" textAnchor="middle">
          São Paulo
        </text>
        <text x="175" y="225" fontSize="8" fill="#1f2937" fontWeight="bold" textAnchor="middle">
          Buenos Aires
        </text>
        <text x="180" y="140" fontSize="7" fill="#1f2937" fontWeight="bold" textAnchor="middle">
          Bogotá
        </text>
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Alta actividad</span>
        </div>
      </div>
    </div>
  );
};