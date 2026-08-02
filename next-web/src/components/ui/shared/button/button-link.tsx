import Link, {LinkProps} from "next/link";
import {buttonStyles} from "@/components/ui/shared/button/button";
import {VariantProps} from "class-variance-authority";
import {ReactNode} from "react";

export interface ButtonLinkProps extends LinkProps,
  VariantProps<typeof buttonStyles> {
  children: ReactNode;
  className?: string;
}

export default function ButtonLink(
  {
    variant,
    size,
    fullWidth,
    className,
    children,
    ...props
  }: ButtonLinkProps
) {
  return (
    <Link
      className={buttonStyles({variant, size, fullWidth, className})}
      {...props}
    >
      {children}
    </Link>
  )
}