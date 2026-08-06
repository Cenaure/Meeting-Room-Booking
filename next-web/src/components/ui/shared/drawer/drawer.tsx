import {cva, VariantProps} from "class-variance-authority";
import {HTMLAttributes, ReactNode, useEffect, useState} from "react";
import {createPortal} from "react-dom";

const drawerStyles = cva(
  "flex flex-col bg-surface-1 border-border duration-200",
  {
    variants: {
      side: {
        left: "inset-y-0 left-0 h-full w-72 max-w-[85vw] border-r",
        right: "inset-y-0 right-0 h-full w-72 max-w-[85vw] border-l",
      },
      animationState: {
        open: "animate-in ease-out",
        closed: "animate-out ease-in fill-mode-forwards",
      },
    },
    compoundVariants: [
      {side: "left", animationState: "open", class: "slide-in-from-left"},
      {side: "left", animationState: "closed", class: "slide-out-to-left"},
      {side: "right", animationState: "open", class: "slide-in-from-right"},
      {side: "right", animationState: "closed", class: "slide-out-to-right"},
    ],
    defaultVariants: {
      side: "left",
      animationState: "open",
    },
  }
);

const backdropStyles = cva(
  "fixed inset-0 z-50 dark:bg-zinc-900/20 bg-zinc-900/50 duration-200 backdrop-blur-xs",
  {
    variants: {
      animationState: {
        open: "animate-in fade-in-0",
        closed: "animate-out fade-out-0 fill-mode-forwards",
      },
    },
    defaultVariants: {
      animationState: "open",
    },
  }
);


export interface DrawerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof drawerStyles> {
  children: ReactNode;
  onClose: () => void;
}

export default function Drawer({children, side, className, onClose, ...props}: DrawerProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (isClosing) onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!mounted) return null;

  const currentState = isClosing ? "closed" : "open";

  return createPortal(
    <div
      className={backdropStyles({animationState: currentState})}
      onClick={handleClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        className={drawerStyles({side, animationState: currentState, className})}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}