import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-sky-600 text-white shadow-xs hover:bg-sky-500 hover:shadow-sky-500/20 active:bg-sky-700",
        destructive: "bg-red-600 text-white shadow-xs hover:bg-red-500 active:bg-red-700",
        outline: "border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-sky-50/70 hover:text-sky-700 hover:border-sky-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-sky-950 dark:hover:text-sky-300",
        secondary: "bg-sky-50 text-sky-800 shadow-xs hover:bg-sky-100 hover:text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 dark:hover:bg-sky-900",
        ghost: "text-slate-600 hover:bg-sky-50/80 hover:text-sky-700 dark:text-slate-400 dark:hover:bg-sky-950/60 dark:hover:text-sky-300",
        link: "text-sky-600 underline-offset-4 hover:underline dark:text-sky-400",
      },
      size: {
        default: "h-9.5 px-4 py-2",
        sm: "h-8.5 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-7 text-base font-semibold",
        icon: "h-9.5 w-9.5",
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
