"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { type ReactNode } from "react";

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

export function DropdownMenu({
  trigger,
  children,
  align = "end",
  sideOffset = 4,
  className = "",
}: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild className={className}>
        {trigger}
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={sideOffset}
          className="z-50 min-w-[180px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] py-1 shadow-[var(--shadow-elevated)]"
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

export const DropdownMenuItem = DropdownMenuPrimitive.Item;
export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;
