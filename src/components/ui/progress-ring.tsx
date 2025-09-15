import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number // 0-100
  size?: number // diameter in pixels
  strokeWidth?: number
  showValue?: boolean
}

function ProgressRing({ 
  progress, 
  size = 48, 
  strokeWidth = 4, 
  showValue = true,
  className,
  ...props 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const getColor = () => {
    if (progress >= 70) return "hsl(var(--success))"
    if (progress >= 40) return "hsl(var(--accent))"
    return "hsl(var(--muted-foreground))"
  }

  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{
            filter: progress >= 70 ? "drop-shadow(0 0 6px hsl(var(--success) / 0.4))" : undefined
          }}
        />
      </svg>
      
      {showValue && (
        <span 
          className="absolute text-xs font-medium transition-colors duration-300"
          style={{ color: getColor() }}
        >
          {progress}
        </span>
      )}
    </div>
  )
}

export { ProgressRing }