import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  // Base — shared across every variant
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium " +
  "ring-offset-background transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",

        // Solid violet — no gradient, just clean depth via shadow + inset highlight
        primary:
          "bg-violet-600 text-white border border-violet-500/40 " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.11),0_4px_18px_rgba(124,58,237,0.28)] " +
          "hover:bg-violet-500 " +
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_24px_rgba(124,58,237,0.44)] " +
          "active:translate-y-px",

        // Ghost nav link — no border until hover
        nav:
          "text-white/55 hover:text-white hover:bg-white/5 " +
          "border border-transparent hover:border-white/8",

        // Outlined — subtle border, reveals on hover
        outline:
          "border border-white/10 bg-transparent text-white/65 " +
          "hover:bg-white/5 hover:border-white/18 hover:text-white",

        // Filled secondary surface
        secondary:
          "bg-white/5 text-white/75 border border-white/8 " +
          "hover:bg-white/9 hover:text-white hover:border-white/14",

        ghost:
          "text-white/55 hover:text-white hover:bg-white/5",

        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",

        link:
          "text-violet-400 underline-offset-4 hover:underline hover:text-violet-300",

        // Legacy — kept for backward compat
        generate:
          "bg-violet-600 text-white font-semibold " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.11),0_4px_20px_rgba(124,58,237,0.3)] " +
          "hover:bg-violet-500 " +
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_28px_rgba(124,58,237,0.5)] " +
          "border border-violet-500/40 active:translate-y-px",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-lg",
        sm:      "h-8 px-3 text-xs rounded-lg",
        lg:      "h-11 px-6 rounded-lg",
        icon:    "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
