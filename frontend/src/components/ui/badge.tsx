import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-stone-900 text-white shadow-xs hover:bg-stone-800",
        secondary:
          "border-transparent bg-stone-100 text-stone-800 hover:bg-stone-200/80",
        luxury:
          "border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#94761e] shadow-2xs font-bold",
        outline:
          "border border-stone-200 text-stone-600 bg-white/70",
        success:
          "border border-emerald-200/60 bg-emerald-50 text-emerald-700 font-medium",
        warning:
          "border border-amber-200/60 bg-amber-50 text-amber-800 font-medium",
        destructive:
          "border-transparent bg-rose-500 text-white shadow-xs hover:bg-rose-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
