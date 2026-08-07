import {cva, type VariantProps} from "class-variance-authority";
import {forwardRef, InputHTMLAttributes, useId} from "react";

const radioStyles = cva(
  [
    "flex cursor-pointer items-start gap-3 rounded-md p-3",
    "ring-1 ring-border bg-surface-1",
    "transition-all duration-100 ease-out",
    "hover:ring-foreground/25",
    "has-[:checked]:ring-2 has-[:checked]:ring-lavender-500/50 dark:has-[:checked]:ring-lavender-400/50",
    "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lavender-500/50",
  ],
  {
    variants: {
      state: {
        default: "",
        error: "ring-red-500",
      },
    },
    defaultVariants: { state: "default" },
  },
);

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">,
    VariantProps<typeof radioStyles> {
  label?: string;
  error?: string;
  options: RadioOption[];
}

const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  (
    { label, error, options, state, className, name, id, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const groupId = id ?? generatedId;
    const errorId = `${groupId}-error`;

    return (
      <fieldset
        className="flex flex-col gap-1.5"
      >
        {label && (
          <legend className="mb-1.5 text-sm font-medium text-foreground">
            {label}
          </legend>
        )}

        <div className={"flex flex-col gap-2"}>
          {options.map((option) => (
            <label
              key={option.value}
              className={radioStyles({
                state: error ? "error" : state,
                className,
              })}
            >
              <div className="grid place-items-center mt-0.5">
                <input
                  ref={ref}
                  type="radio"
                  name={name}
                  value={option.value}
                  className="peer appearance-none col-start-1 row-start-1 w-4 aspect-square border-2 border-lavender-500 dark:border-lavender-400 rounded-full"
                  {...props}
                />
                <div className="col-start-1 row-start-1 w-2 h-2 rounded-full peer-[:checked]:bg-lavender-500 dark:peer-[:checked]:bg-lavender-400 transition-colors"/>
              </div>


              <span className="flex flex-col gap-0.5">
                <span className="text-sm text-foreground">{option.label}</span>
                {option.description && (
                  <span className="text-sm text-foreground/60">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>

        <span id={errorId} className="block min-h-5 text-sm text-red-500">
          {error ?? " "}
        </span>
      </fieldset>
    );
  },
);

export default RadioGroup;