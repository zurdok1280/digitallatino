import * as React from "react"
import { cn } from "@/lib/utils"

interface WaveformProps {
  isPlaying?: boolean
  className?: string
  bars?: number
  height?: number
}

function Waveform({ 
  isPlaying = false, 
  className, 
  bars = 5, 
  height = 16 
}: WaveformProps) {
  const barHeights = React.useMemo(() => {
    return Array.from({ length: bars }, () => Math.random() * 0.7 + 0.3)
  }, [bars])

  return (
    <div 
      className={cn(
        "flex items-end gap-0.5 justify-center",
        className
      )}
      style={{ height }}
    >
      {barHeights.map((heightPercent, index) => (
        <div
          key={index}
          className={cn(
            "bg-current rounded-sm transition-all duration-150 ease-in-out",
            isPlaying ? "animate-pulse" : ""
          )}
          style={{
            width: Math.max(2, height / bars),
            height: `${heightPercent * 100}%`,
            animationDelay: `${index * 100}ms`,
            animationDuration: `${800 + Math.random() * 400}ms`
          }}
        />
      ))}
    </div>
  )
}

export { Waveform }