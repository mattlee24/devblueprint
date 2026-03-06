"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Optional class for the content box (e.g. max-w-2xl w-full to widen). */
  contentClassName?: string;
  /** Optional class for the inner content wrapper (e.g. flex-1 min-h-0 for scrollable panel). */
  contentInnerClassName?: string;
}

export function Modal({ open, onClose, title, children, contentClassName, contentInnerClassName }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
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
        className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-card)] shadow-lg ${contentClassName ?? "max-w-md"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {title ? (
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <h2 className="text-lg font-medium">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded hover:bg-[var(--bg-hover)] transition-[var(--transition)] cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end px-4 py-2 border-b border-[var(--border)]">
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded hover:bg-[var(--bg-hover)] transition-[var(--transition)] cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className={contentInnerClassName ?? "p-4"}>{children}</div>
        </div>
      </div>
    </>
  );
}
