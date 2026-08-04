"use client";

import {HTMLAttributes, ReactNode, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {cva, VariantProps} from "class-variance-authority";
import {useModal} from "@/stores/modal.store";
import Button from "@/components/ui/shared/button/button";
import {XIcon} from "@phosphor-icons/react/ssr";

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
  "fixed inset-0 z-50 md:flex md:items-center md:justify-center dark:bg-zinc-900/20 bg-zinc-900/50 duration-200 backdrop-blur-xs",
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
  const close = useModal(state => state.close);
  const setClose = useModal(state => state.setClose);

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setClose(false);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, ANIMATION_DURATION);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

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

  useEffect(() => {
    if (!close) return;
    handleClose();
  }, [close]);

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
        <div
          className="md:hidden relative w-full"
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