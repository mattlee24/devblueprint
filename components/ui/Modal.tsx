"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { type ReactNode } from "react";
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
  /** Optional class for the overlay (e.g. backdrop blur). */
  overlayClassName?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  contentClassName,
  contentInnerClassName,
  overlayClassName,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={`fixed inset-0 z-40 cursor-pointer ${overlayClassName ?? "bg-black/50"} data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`}
          style={{ transition: "var(--transition)" }}
        />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-8 outline-none"
          onPointerDownOutside={onClose}
          onEscapeKeyDown={onClose}
        >
          <div
            className={`w-full bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-modal)] ${contentClassName ?? "max-w-md"}`}
            style={{ boxShadow: "var(--shadow-modal)" }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {title ? (
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] rounded-t-[var(--radius-lg)]">
                <Dialog.Title className="text-lg font-semibold text-[var(--text-primary)]">
                  {title}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-[var(--transition)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
            ) : (
              <div className="flex items-center justify-end px-4 py-2 border-b border-[var(--border)] rounded-t-[var(--radius-lg)]">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-[var(--transition)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </div>
            )}
            <div className={contentInnerClassName ?? "p-4"}>{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
