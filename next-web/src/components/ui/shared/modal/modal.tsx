"use client";

import {HTMLAttributes, ReactNode, useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {cva, VariantProps} from "class-variance-authority";
import {useModal} from "@/stores/modal.store";
import Button from "@/components/ui/shared/button/button";
import {XIcon} from "@phosphor-icons/react/ssr";

const modalStyles = cva(
  "bg-transparent duration-200 lg:duration-200",
  {
    variants: {
      animationState: {
        open: "animate-in fade-in-0 zoom-in-95 ease-out",
        closed: "animate-out fade-out-0 zoom-out-95 ease-in fill-mode-forwards",
      },
    },
    defaultVariants: {
      animationState: "open",
    },
  }
);

const backdropStyles = cva(
  "fixed inset-0 z-50 md:flex md:items-center md:justify-center dark:bg-zinc-900/20 bg-zinc-900/50 duration-200 backdrop-blur-xs",
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

export interface ModalProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalStyles> {
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({children, onClose, className}: ModalProps) {
  const close = useModal((state) => state.close);
  const setClose = useModal((state) => state.setClose);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
      setClose(false);
    };
  }, [setClose]);

  const handleClose = () => {
    setIsClosing((prev) => {
      if (prev) return prev;
      setClose(false);
      return true;
    });
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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (close) handleClose();
  }, [close]);

  if (!mounted) return null;

  const currentState = isClosing ? "closed" : "open";

  return createPortal(
    <div
      className={backdropStyles({animationState: currentState})}
      onClick={handleClose}
      onAnimationEnd={handleAnimationEnd}
    >
      <div
        className={modalStyles({animationState: currentState, className})}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="lg:hidden relative w-full"
        >
          <Button
            className="absolute right-0 top-4 z-50"
            variant="ghost"
            onClick={() => handleClose()}
          >
            <XIcon size={24}/>
          </Button>
        </div>


        {children}
      </div>
    </div>,
    document.body
  );
}