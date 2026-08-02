"use client";

import {HTMLAttributes, ReactNode, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {cva, VariantProps} from "class-variance-authority";

const modalStyles = cva(
  "bg-transparent duration-200",
  {
    variants: {
      animationState: {
        open: "animate-in fade-in-0 zoom-in-95 ease-out",
        closed: "animate-out fade-out-0 zoom-out-95 ease-in",
      },
    },
    defaultVariants: {
      animationState: "open",
    },
  }
);

const backdropStyles = cva(
  "fixed inset-0 z-50 flex items-center justify-center dark:bg-zinc-900/20 bg-zinc-900/50 duration-200 backdrop-blur-xs",
  {
    variants: {
      animationState: {
        open: "animate-in fade-in-0",
        closed: "animate-out fade-out-0",
      },
    },
    defaultVariants: {
      animationState: "open",
    },
  }
);

export interface ModalProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalStyles> {
  children: ReactNode;
  onClose: () => void;
}

const ANIMATION_DURATION = 200;

export default function Modal({children, onClose, className}: ModalProps) {
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
    if (isClosing) return;
    setIsClosing(true);

    setTimeout(() => {
      onClose();
    }, ANIMATION_DURATION);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isClosing]);

  if (!mounted) return null;

  const currentState = isClosing ? "closed" : "open";

  return createPortal(
    <div
      className={backdropStyles({animationState: currentState})}
      onClick={handleClose}
    >
      <div
        className={modalStyles({animationState: currentState, className})}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}