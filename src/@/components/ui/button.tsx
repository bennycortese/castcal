import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium " +
  "ring-offset-background transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",

        // Solid indigo — Greptile-style clean primary
        primary:
          "bg-indigo-600 text-white border border-indigo-500/40 " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_18px_rgba(99,102,241,0.28)] " +
          "hover:bg-indigo-500 " +
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_24px_rgba(99,102,241,0.44)] " +
          "active:translate-y-px",

        // Ghost nav link
        nav:
          "text-white/50 hover:text-white hover:bg-white/[0.05] " +
          "border border-transparent hover:border-white/[0.08]",

        // Outlined — works on dark bg
        outline:
          "border border-white/[0.1] bg-transparent text-white/60 " +
          "hover:bg-white/[0.05] hover:border-white/[0.18] hover:text-white",

        // Filled secondary surface
        secondary:
          "bg-white/[0.05] text-white/70 border border-white/[0.08] " +
          "hover:bg-white/[0.09] hover:text-white hover:border-white/[0.14]",

        ghost:
          "text-white/50 hover:text-white hover:bg-white/[0.05]",

        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",

        link:
          "text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300",

        generate:
          "bg-indigo-600 text-white font-semibold " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_20px_rgba(99,102,241,0.3)] " +
          "hover:bg-indigo-500 " +
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_28px_rgba(99,102,241,0.5)] " +
          "border border-indigo-500/40 active:translate-y-px",
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
