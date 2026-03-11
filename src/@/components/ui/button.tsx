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

        // Solid indigo — clean depth via shadow + inset highlight
        primary:
          "bg-indigo-600 text-white border border-indigo-500/40 " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_18px_rgba(79,70,229,0.22)] " +
          "hover:bg-indigo-500 " +
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_24px_rgba(79,70,229,0.35)] " +
          "active:translate-y-px",

        // Ghost nav link — works on light backgrounds
        nav:
          "text-gray-600 hover:text-gray-900 hover:bg-gray-100 " +
          "border border-transparent hover:border-gray-200",

        // Outlined — subtle border, dark text on light bg
        outline:
          "border border-gray-200 bg-white text-gray-700 " +
          "hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 " +
          "shadow-sm",

        // Filled secondary surface
        secondary:
          "bg-gray-100 text-gray-700 border border-gray-200 " +
          "hover:bg-gray-200 hover:text-gray-900",

        ghost:
          "text-gray-600 hover:text-gray-900 hover:bg-gray-100",

        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",

        link:
          "text-indigo-600 underline-offset-4 hover:underline hover:text-indigo-700",

        // Legacy — kept for backward compat
        generate:
          "bg-indigo-600 text-white font-semibold " +
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_20px_rgba(79,70,229,0.25)] " +
          "hover:bg-indigo-500 " +
          "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_28px_rgba(79,70,229,0.4)] " +
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
