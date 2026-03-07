"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { type ReactNode } from "react";

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
}

export function ScrollArea({ children, className = "" }: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      className={`overflow-hidden ${className}`}
    >
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[var(--radius-md)]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Corner />
      <ScrollAreaPrimitive.Scrollbar
        className="flex touch-none select-none transition-colors w-2.5 p-px"
        orientation="vertical"
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-[var(--border-active)] before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Scrollbar
        className="flex touch-none select-none transition-colors h-2.5 p-px"
        orientation="horizontal"
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-[var(--border-active)] before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
}
