import * as React from "react"
import { Toaster as Sonner } from "sonner"
import { Check, X, AlertCircle, Info, Zap } from "lucide-react"

type ToastProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToastProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-glass group-[.toaster]:backdrop-blur-md",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

// Custom toast functions with animations and icons
export const customToast = {
  success: (message: string, description?: string) => {
    return {
      icon: <Check className="w-4 h-4 text-success animate-scale-in" />,
      title: message,
      description,
      className: "border-success/20 bg-success/5 shadow-glow",
      duration: 4000,
    }
  },
  
  error: (message: string, description?: string) => {
    return {
      icon: <X className="w-4 h-4 text-destructive animate-scale-in" />,
      title: message,
      description,
      className: "border-destructive/20 bg-destructive/5",
      duration: 5000,
    }
  },
  
  warning: (message: string, description?: string) => {
    return {
      icon: <AlertCircle className="w-4 h-4 text-warning animate-scale-in" />,
      title: message,
      description,
      className: "border-warning/20 bg-warning/5",
      duration: 4000,
    }
  },
  
  info: (message: string, description?: string) => {
    return {
      icon: <Info className="w-4 h-4 text-info-foreground animate-scale-in" />,
      title: message,
      description,
      className: "border-info/20 bg-info/20",
      duration: 3000,
    }
  },
  
  premium: (message: string, description?: string) => {
    return {
      icon: <Zap className="w-4 h-4 text-white animate-pulse-glow" />,
      title: message,
      description,
      className: "bg-gradient-primary text-white border-0 shadow-float animate-scale-in",
      duration: 4000,
    }
  }
}

export { Toaster }