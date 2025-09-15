import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-300",
  {
    variants: {
      variant: {
        success: "bg-success/10 text-success border border-success/20 shadow-subtle",
        warning: "bg-warning/10 text-warning border border-warning/20 shadow-subtle",
        info: "bg-info text-info-foreground border border-info/20 shadow-subtle",
        premium: "bg-gradient-primary text-white shadow-glow animate-pulse-glow",
        popular: "bg-accent/10 text-accent border border-accent/20 shadow-subtle",
        selected: "bg-primary/10 text-primary border border-primary/20 shadow-glow",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        default: "text-xs px-2.5 py-1",
        lg: "text-sm px-3 py-1.5",
      }
    },
    defaultVariants: {
      variant: "info",
      size: "default",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  icon?: React.ReactNode
}

function StatusBadge({ className, variant, size, icon, children, ...props }: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  )
}

export { StatusBadge, statusBadgeVariants }