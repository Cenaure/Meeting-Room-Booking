"use client";
import {cva, VariantProps} from "class-variance-authority";
import React, {HTMLAttributes, ReactNode, useEffect, useId, useRef, useState} from "react";

const hintStyles = cva(
  [
    "absolute rounded-md bg-surface-0 px-2 py-1.5 text-xs shadow-sm ring-1 ring-border z-50",
    "pointer-events-none whitespace-nowrap",
    "animate-in fade-in transition-all duration-200 ease-out",
  ],
  {
    variants: {
      position: {
        top: ["bottom-full left-1/2 -translate-x-1/2 mb-2"],
        bottom: ["top-full left-1/2 -translate-x-1/2 mt-2"],
        left: ["right-full top-1/2 -translate-y-1/2 mr-2"],
        right: ["left-full top-1/2 -translate-y-1/2 ml-2"],
      },
    },
    defaultVariants: {
      position: "bottom",
    },
  },
);

let isGroupActive = false;
let groupResetTimer: ReturnType<typeof setTimeout> | null = null;

function activateGroup() {
  isGroupActive = true;
  if (groupResetTimer) {
    clearTimeout(groupResetTimer);
    groupResetTimer = null;
  }
}

function scheduleGroupDeactivation(groupTimeout: number) {
  if (groupResetTimer) clearTimeout(groupResetTimer);
  groupResetTimer = setTimeout(() => {
    isGroupActive = false;
    groupResetTimer = null;
  }, groupTimeout);
}

export interface HintProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof hintStyles> {
  content: string;
  children: ReactNode;
  delay?: number;
  groupTimeout?: number;
  disabled?: boolean;
}

export default function Hint({
                               position,
                               className,
                               content,
                               children,
                               delay = 300,
                               groupTimeout = 300,
                               disabled = false,
                               ...props
                             }: HintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisibleRef = useRef(isVisible);
  const tooltipId = useId();

  isVisibleRef.current = isVisible;

  const clearShowTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const show = () => {
    setIsVisible(true);
    activateGroup();
  };

  const handleMouseEnter = () => {
    if (disabled || !content) return;

    if (isGroupActive) {
      clearShowTimer();
      show();
    } else {
      timerRef.current = setTimeout(show, delay);
    }
  };

  const handleMouseLeave = () => {
    clearShowTimer();
    setIsVisible(false);
    scheduleGroupDeactivation(groupTimeout);
  };

  useEffect(() => {
    return () => {
      clearShowTimer();
      if (isVisibleRef.current) {
        scheduleGroupDeactivation(groupTimeout);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-flex items-center group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}

      {isVisible && content && (
        <div
          id={tooltipId}
          role="tooltip"
          className={hintStyles({position, className})}
          {...props}
        >
          {content}
        </div>
      )}
    </div>
  );
}