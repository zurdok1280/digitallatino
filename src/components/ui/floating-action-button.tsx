import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "./button"

interface FloatingActionButtonProps extends ButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, position = 'bottom-right', ...props }, ref) => {
    const positionClasses = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6',
      'top-right': 'fixed top-6 right-6',
      'top-left': 'fixed top-6 left-6'
    }

    return (
      <Button
        ref={ref}
        className={cn(
          "z-50 w-14 h-14 rounded-full shadow-float hover:shadow-large transition-all duration-300 hover:scale-110",
          positionClasses[position],
          className
        )}
        size="icon"
        {...props}
      />
    )
  }
)

FloatingActionButton.displayName = "FloatingActionButton"

export { FloatingActionButton }