"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProposalSlide, ProposalSlideBlock } from "@/lib/queries/proposals";
import { ChevronLeft, ChevronRight, X, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ProposalDeckPreviewProps {
  slides: ProposalSlide[];
  title?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
  companyName?: string;
}

/** Accent bar + optional icon for slide title */
function SlideTitleBar({
  slideTitle,
  slideIndex,
  totalSlides,
  isCover,
  isThankYou,
}: {
  slideTitle: string;
  slideIndex: number;
  totalSlides: number;
  isCover: boolean;
  isThankYou: boolean;
}) {
  const number = String(slideIndex + 1).padStart(2, "0");
  return (
    <div className="relative mb-6">
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
        style={{ background: "var(--gradient-accent)" }}
      />
      <div className="pl-4">
        <span className="text-xs font-medium text-[var(--accent)] tracking-wider">
          {number} / {totalSlides}
        </span>
        <h2
          className={`mt-1 font-semibold text-[var(--text-primary)] ${
            isCover ? "text-2xl md:text-3xl" : isThankYou ? "text-2xl" : "text-xl"
          }`}
        >
          {slideTitle}
        </h2>
      </div>
    </div>
  );
}

function SlideBlock({ block }: { block: ProposalSlideBlock }) {
  const content = block.content?.trim() ?? "";
  if (!content && block.type !== "heading") return null;

  switch (block.type) {
    case "heading": {
      const level = Math.min(3, Math.max(1, block.level ?? 1));
      const baseCn = "font-semibold mb-3 mt-4 first:mt-0 text-[var(--text-primary)]";
      const accentCn = level === 1 ? "text-[var(--accent)]" : "";
      if (level === 1) return <h1 className={`${baseCn} text-xl ${accentCn}`}>{content}</h1>;
      if (level === 2) return <h2 className={`${baseCn} text-lg ${accentCn}`}>{content}</h2>;
      return <h3 className={`${baseCn} text-base ${accentCn}`}>{content}</h3>;
    }
    case "paragraph":
      return (
        <p className="text-[var(--text-secondary)] leading-relaxed mb-3 last:mb-0">
          {content}
        </p>
      );
    case "bullets": {
      const items = content.split(/\n/).filter((s) => s.trim());
      return (
        <ul className="space-y-2 mb-4 last:mb-0">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[var(--text-secondary)]">
              <span className="mt-1.5 shrink-0 w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-[var(--accent)]" strokeWidth={2.5} />
              </span>
              <span>{item.trim()}</span>
            </li>
          ))}
        </ul>
      );
    }
    case "numbered": {
      const items = content.split(/\n/).filter((s) => s.trim());
      return (
        <ol className="space-y-2 mb-4 last:mb-0">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[var(--text-secondary)]">
              <span
                className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold text-[var(--accent-foreground)]"
                style={{ background: "var(--gradient-accent)" }}
              >
                {i + 1}
              </span>
              <span>{item.trim()}</span>
            </li>
          ))}
        </ol>
      );
    }
    case "image":
      return (
        <div className="my-4 rounded-xl overflow-hidden border border-[var(--border)] shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content}
            alt=""
            className="max-w-full max-h-[280px] object-contain w-full"
          />
        </div>
      );
    default:
      return (
        <p className="text-[var(--text-secondary)] leading-relaxed mb-3 last:mb-0">
          {content}
        </p>
      );
  }
}

export function ProposalDeckPreview({
  slides,
  title,
  onClose,
  showCloseButton = false,
  className = "",
  companyName,
}: ProposalDeckPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = slides.length;
  const slide = total > 0 ? slides[currentIndex] : null;
  const isCover = currentIndex === 0;
  const isThankYou = total > 0 && currentIndex === total - 1;

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i < total - 1 ? i + 1 : i));
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        goNext();
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        goPrev();
        e.preventDefault();
      } else if (e.key === "Escape" && onClose) {
        onClose();
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, onClose]);

  if (total === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-[320px] rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] ${className}`}
      >
        <p>No slides to show.</p>
        {showCloseButton && onClose && (
          <Button variant="secondary" onClick={onClose} className="mt-4 cursor-pointer">
            Close
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-base)] overflow-hidden ${className}`}
      role="region"
      aria-label="Proposal slide deck"
    >
      <header className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-surface)]">
        {title && (
          <h2 className="text-sm font-medium text-[var(--text-primary)] truncate flex items-center gap-2">
            <span className="w-0.5 h-4 rounded-full bg-[var(--accent)]" aria-hidden />
            {title}
          </h2>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <span
            className="text-xs font-medium text-[var(--text-muted)] tabular-nums px-2 py-0.5 rounded bg-[var(--bg-elevated)]"
            aria-live="polite"
          >
            {currentIndex + 1} / {total}
          </span>
          {showCloseButton && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-pointer"
              aria-label="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 flex items-stretch">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentIndex <= 0}
          className="shrink-0 w-12 flex items-center justify-center border-r border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[var(--text-primary)]"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          className={`flex-1 min-w-0 flex flex-col p-6 md:p-10 overflow-auto ${
            isCover
              ? "bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-elevated)] to-[var(--bg-surface)]"
              : isThankYou
                ? "bg-[var(--bg-surface)]"
                : "bg-[var(--bg-surface)]"
          }`}
        >
          <div className="max-w-2xl mx-auto w-full">
            <SlideTitleBar
              slideTitle={slide?.title ?? "Slide"}
              slideIndex={currentIndex}
              totalSlides={total}
              isCover={isCover}
              isThankYou={isThankYou}
            />
            <div
              className={`rounded-xl p-6 md:p-8 ${
                isCover
                  ? "bg-[var(--bg-elevated)]/80 border border-[var(--border)]"
                  : "bg-[var(--bg-elevated)]/50 border border-[var(--border)]"
              }`}
            >
              {isCover && (
                <div className="flex justify-end mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                    Proposal
                  </span>
                </div>
              )}
              <div className="space-y-0">
                {(slide?.blocks ?? []).map((block) => (
                  <SlideBlock key={block.id} block={block} />
                ))}
                {(!slide?.blocks || slide.blocks.length === 0) && (
                  <p className="text-[var(--text-muted)] text-sm">No content</p>
                )}
              </div>
              {isCover && companyName && (
                <p className="mt-8 pt-4 border-t border-[var(--border)] text-right text-xs text-[var(--text-muted)]">
                  Prepared by {companyName}
                </p>
              )}
              {isThankYou && (
                <div className="mt-8 flex justify-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "var(--gradient-accent)" }}
                  >
                    <Check className="w-6 h-6 text-[var(--accent-foreground)]" strokeWidth={2} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={currentIndex >= total - 1}
          className="shrink-0 w-12 flex items-center justify-center border-l border-[var(--border)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[var(--text-primary)]"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="shrink-0 flex items-center justify-center gap-2 py-3 border-t border-[var(--border)] bg-[var(--bg-surface)]">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className={`rounded-full cursor-pointer transition-[var(--transition)] ${
              i === currentIndex
                ? "w-2.5 h-2.5 bg-[var(--accent)] ring-2 ring-[var(--accent)]/40"
                : "w-2 h-2 bg-[var(--border)] hover:bg-[var(--text-muted)]"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
