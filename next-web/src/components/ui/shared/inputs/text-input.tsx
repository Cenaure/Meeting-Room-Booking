import {cva, type VariantProps} from "class-variance-authority";
import {forwardRef, InputHTMLAttributes, useId, useState} from "react";
import {EyeIcon, EyeSlashIcon} from "@phosphor-icons/react/ssr";

const inputStyles = cva(
  [
    "w-full rounded-md bg-surface-1 text-foreground",
    "ring-1 ring-border",
    "px-4 outline-none",
    "transition-all duration-100 ease-out",
    "placeholder:text-foreground/40",
    "focus:ring-2 focus:ring-lavender-500/50 dark:focus:ring-lavender-400/50",
    "disabled:opacity-40 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      size: {
        sm: "h-8 text-sm",
        md: "h-9 text-sm",
        lg: "h-11 px-4 text-base",
      },
      state: {
        default: "",
        error: "ring-red-500 focus:ring-red-500",
        noError: ""
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputStyles> {
  label?: string;
  error?: string;
}

const TextInput = forwardRef<HTMLInputElement, InputProps>(
  ({size, state, label, error, className, type, id, ...props}, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword && showPassword ? "text" : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={resolvedType}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={inputStyles({
              size,
              state: error ? "error" : state,
              className: isPassword ? "pr-10" : className,
            })}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-foreground/50 hover:text-foreground"
            >
              {showPassword ? <EyeSlashIcon size={16}/> : <EyeIcon size={16}/>}
            </button>
          )}
        </div>

        {state != "noError" && <span
          id={errorId}
          className="text-sm text-red-500 min-h-5 block"
        >
          {error ?? " "}
        </span>}
      </div>
    );
  }
);

export default TextInput;