import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        action:
          "bg-action text-action-foreground border-action shadow-action hover:brightness-105 hover:shadow-lg hover:scale-[1.01] active:brightness-95 active:scale-[0.99] relative font-medium transition-all after:content-[''] after:absolute after:inset-0 after:rounded-md after:animate-pulse after:bg-action-glow",
        // New variants based on status colors
        success:
          "bg-success text-white shadow-xs hover:bg-success/90 focus-visible:ring-success/20 dark:focus-visible:ring-success/40",
        warning:
          "bg-warning text-white shadow-xs hover:bg-warning/90 focus-visible:ring-warning/20 dark:focus-visible:ring-warning/40",
        error:
          "bg-error text-white shadow-xs hover:bg-error/90 focus-visible:ring-error/20 dark:focus-visible:ring-error/40",
        completed:
          "bg-completed text-white shadow-xs hover:bg-completed/90 focus-visible:ring-completed/20 dark:focus-visible:ring-completed/40",
        // Outline variants for status colors
        "outline-success": "border border-success text-success bg-transparent shadow-xs hover:bg-success/10",
        "outline-warning": "border border-warning text-warning bg-transparent shadow-xs hover:bg-warning/10",
        "outline-error": "border border-error text-error bg-transparent shadow-xs hover:bg-error/10",
        "outline-completed": "border border-completed text-completed bg-transparent shadow-xs hover:bg-completed/10",
        // Subtle variants with lighter backgrounds
        "subtle-success": "bg-success/15 text-success shadow-xs hover:bg-success/25",
        "subtle-warning": "bg-warning/15 text-warning shadow-xs hover:bg-warning/25",
        "subtle-error": "bg-error/15 text-error shadow-xs hover:bg-error/25",
        "subtle-completed": "bg-completed/15 text-completed shadow-xs hover:bg-completed/25",
        // Ghost variants that only show color on hover
        "ghost-success": "text-success hover:bg-success/15",
        "ghost-warning": "text-warning hover:bg-warning/15",
        "ghost-error": "text-error hover:bg-error/15",
        "ghost-completed": "text-completed hover:bg-completed/15",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        // New size variants
        xs: "h-7 rounded-md gap-1 px-2.5 text-xs has-[>svg]:px-2",
        xl: "h-12 rounded-md px-8 text-base has-[>svg]:px-6",
        "2xl": "h-14 rounded-md px-10 text-lg has-[>svg]:px-8",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        "icon-xs": "size-7",
        "icon-xl": "size-12",
        pill: "h-9 px-5 py-2 rounded-full",
        "pill-sm": "h-8 px-4 py-1.5 rounded-full text-xs",
        "pill-lg": "h-10 px-6 py-2.5 rounded-full",
      },
      // New width variant for full-width buttons
      width: {
        default: "",
        full: "w-full",
      },
      // New elevation variant for different shadow levels
      elevation: {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
      },
      // New animation variant for different hover effects
      animation: {
        none: "",
        scale: "hover:scale-105 active:scale-95 transition-transform",
        pulse: "hover:animate-pulse",
        bounce: "hover:animate-bounce",
        glow: "relative after:content-[''] after:absolute after:inset-0 after:rounded-md after:animate-pulse after:bg-current/20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      width: "default",
      elevation: "none",
      animation: "none",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
