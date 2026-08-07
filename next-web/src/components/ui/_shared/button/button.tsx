import {cva, type VariantProps} from "class-variance-authority";
import {ButtonHTMLAttributes, ReactNode} from "react";
import {CircleNotchIcon} from "@phosphor-icons/react/ssr";

export const buttonStyles = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "rounded-md font-medium tracking-tight",
    "transition-all duration-100 ease-out",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-lavender-950 text-lavender-50 dark:bg-zinc-800/80",
          "border-1 border-border",
          "hover:bg-lavender-900 hover:border-gray-700  dark:hover:bg-zinc-700/50 dark:hover:border-zinc-800 hover:text-white",
        ],
        outline: [
          "bg-surface-3/25",
          "border border-border",
          "hover:bg-surface-3/50 hover:border-gray-300  dark:hover:border-zinc-800"
        ],
        destructive: [
          "bg-red-500/20 border-1 border-red-400 text-red-500/90",
          "hover:bg-red-500/15 text-red-500 hover:border-2"
        ],
        ghost: "bg-transparent text-foreground hover:bg-zinc-200/90 dark:hover:bg-zinc-800/90",
        none: ""
      },
      size: {
        auto: "text-sm",
        sm: "h-6 px-3 text-sm",
        md: "h-8 px-4 text-sm",
        lg: "h-9 px-6 text-base",
      },
      fullWidth: {
        true: "w-full"
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  children: ReactNode;
  loading?: boolean;
}

export default function Button({
                                 children,
                                 variant,
                                 size,
                                 loading,
                                 disabled,
                                 fullWidth,
                                 className,
                                 ...props
                               }: ButtonProps) {
  return (
    <button
      className={buttonStyles({variant, size, fullWidth, className})}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <CircleNotchIcon size={16} className="animate-spin"/>}
      {children}
    </button>
  )
}