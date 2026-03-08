"use client";

import { useEffect, type ReactNode } from "react";
import { X, Clock } from "lucide-react";
import { Button } from "./Button";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg" | "logTime";
  /** When true, show Clock icon + monospace title and teal top border (for Log Time panel). */
  logTimeStyle?: boolean;
}

const widthClass = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  logTime: "w-96",
};

export function Drawer({ open, onClose, title, children, width = "md", logTimeStyle = false }: DrawerProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-[var(--transition)] cursor-pointer"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`fixed top-0 right-0 h-full ${widthClass[width]} bg-white border-l border-neutral-200 z-50 flex flex-col shadow-2xl transition-[var(--transition)] ${
          logTimeStyle ? "border-t-2 border-t-teal-500" : ""
        }`}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
            {logTimeStyle ? (
              <h2 className="text-base font-semibold font-mono text-neutral-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-500" />
                {title}
              </h2>
            ) : (
              <h2 className="text-lg font-medium text-neutral-900">{title}</h2>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
}
