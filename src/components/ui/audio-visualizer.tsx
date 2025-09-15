import * as React from "react"
import { cn } from "@/lib/utils"

interface AudioVisualizerProps {
  isPlaying: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function AudioVisualizer({ isPlaying, size = 'md', className }: AudioVisualizerProps) {
  const sizeConfig = {
    sm: { bars: 4, height: 12, gap: 1 },
    md: { bars: 5, height: 16, gap: 1 },
    lg: { bars: 7, height: 24, gap: 2 }
  }
  
  const config = sizeConfig[size]
  
  return (
    <div 
      className={cn(
        "flex items-end justify-center",
        className
      )}
      style={{ 
        height: config.height,
        gap: config.gap
      }}
    >
      {Array.from({ length: config.bars }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "bg-current rounded-full transition-all duration-200",
            isPlaying 
              ? "animate-bounce" 
              : "opacity-50"
          )}
          style={{
            width: Math.max(2, config.height / config.bars),
            height: isPlaying 
              ? `${Math.random() * 80 + 20}%` 
              : '30%',
            animationDelay: `${index * 0.1}s`,
            animationDuration: `${0.6 + Math.random() * 0.4}s`
          }}
        />
      ))}
    </div>
  )
}

export { AudioVisualizer }