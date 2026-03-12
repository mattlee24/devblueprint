"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProposalSlide, ProposalSlideBlock } from "@/lib/queries/proposals";
import { ArrowLeft, ArrowRight, X, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ProposalDeckPreviewProps {
  slides: ProposalSlide[];
  title?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
  companyName?: string;
}

const PROPOSAL_ACCENT = "var(--proposal-accent, #00A896)";

/** Parse a bullet line for add-ons: "Title — £850" or "Title" (no price) */
function parseAddOnLine(line: string): { title: string; description?: string; price?: string } {
  const trimmed = line.trim();
  const priceMatch = trimmed.match(/\s*[—–-]\s*(£\d+(?:,\d{3})*(?:\.\d{2})?)\s*$/);
  if (priceMatch) {
    const price = priceMatch[1];
    const titlePart = trimmed.slice(0, priceMatch.index).trim();
    return { title: titlePart, price };
  }
  const dashSplit = trimmed.split(/\s+[—–-]\s+/);
  if (dashSplit.length >= 2) {
    const last = dashSplit[dashSplit.length - 1];
    if (/^£\d+/.test(last.trim())) {
      return {
        title: dashSplit.slice(0, -1).join(" — ").trim(),
        price: last.trim(),
      };
    }
  }
  return { title: trimmed };
}

function isAddOnsSlide(slideTitle: string): boolean {
  const t = slideTitle.toLowerCase();
  return t.includes("optional add-on") || t.includes("optional add-ons") || t.includes("add-on");
}

/** Optional add-ons slide: pricing-style rows with checkmark, title, price */
function AddOnsSlideContent({ blocks }: { blocks: ProposalSlideBlock[] }) {
  const bulletBlock = blocks.find((b) => b.type === "bullets");
  const content = bulletBlock?.content ?? "";
  const lines = content.split(/\n/).filter((s) => s.trim());
  const items = lines.map((line) => parseAddOnLine(line));

  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-start justify-between gap-4 py-4 border-b border-[#F0F0F0] last:border-b-0 hover:bg-teal-50/30 transition-colors duration-150"
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span
              className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(0,168,150,0.2)" }}
            >
              <Check className="w-3 h-3 text-teal-600" strokeWidth={2.5} />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-[#1A1A1A]">{item.title}</p>
              {item.description && (
                <p className="text-sm text-[#4A4A4A] mt-0.5">{item.description}</p>
              )}
            </div>
          </div>
          {item.price && (
            <span className="shrink-0 font-semibold text-teal-600 tabular-nums">{item.price}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Accent bar + slide number (01/9) + title — used inside slide content */
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
    <div className="relative mb-6 pl-5 border-l-4 border-teal-500" style={{ borderColor: PROPOSAL_ACCENT }}>
      <div className="flex items-baseline gap-2">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: PROPOSAL_ACCENT }}
        >
          {number}
        </span>
        <span className="text-sm text-[#4A4A4A] font-medium">/ {totalSlides}</span>
      </div>
      <h2
        className={`mt-2 proposal-display-font font-semibold text-[#1A1A1A] leading-tight ${
          isCover ? "text-2xl md:text-3xl" : isThankYou ? "text-2xl" : "text-xl md:text-2xl"
        }`}
      >
        {slideTitle}
      </h2>
    </div>
  );
}

function SlideBlock({ block }: { block: ProposalSlideBlock }) {
  const content = block.content?.trim() ?? "";
  if (!content && block.type !== "heading") return null;

  const accent = PROPOSAL_ACCENT;

  switch (block.type) {
    case "heading": {
      const level = Math.min(3, Math.max(1, block.level ?? 1));
      const baseCn = "font-semibold mb-3 mt-4 first:mt-0 text-[#1A1A1A] proposal-display-font";
      if (level === 1) return <h1 className={`${baseCn} text-xl`} style={{ color: accent }}>{content}</h1>;
      if (level === 2) return <h2 className={`${baseCn} text-lg`}>{content}</h2>;
      return <h3 className={`${baseCn} text-base`}>{content}</h3>;
    }
    case "paragraph":
      return (
        <p className="text-[#4A4A4A] leading-relaxed mb-3 last:mb-0 text-[15px]">
          {content}
        </p>
      );
    case "bullets": {
      const items = content.split(/\n/).filter((s) => s.trim());
      return (
        <ul className="space-y-2 mb-4 last:mb-0">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[#4A4A4A]">
              <span
                className="mt-1.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(0,168,150,0.2)" }}
              >
                <Check className="w-3 h-3 text-teal-600" strokeWidth={2.5} />
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
            <li key={i} className="flex items-start gap-3 text-[#4A4A4A]">
              <span
                className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold text-white bg-teal-500"
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
        <div className="my-4 rounded-xl overflow-hidden border border-[#E8E8E8] shadow-sm">
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
        <p className="text-[#4A4A4A] leading-relaxed mb-3 last:mb-0">
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
  const isAddOns = slide ? isAddOnsSlide(slide.title) : false;
  const addOnsBlocks = isAddOns && slide?.blocks ? slide.blocks : [];

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
        className={`proposal-preview flex flex-col items-center justify-center min-h-[320px] rounded-2xl border border-[#E8E8E8] bg-white text-[#4A4A4A] ${className}`}
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
      className={`proposal-preview flex flex-col rounded-2xl border border-[#E8E8E8] bg-white overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.12)] border-t-4 ${className}`}
      style={{ borderTopColor: PROPOSAL_ACCENT }}
      role="region"
      aria-label="Proposal slide deck"
    >
      <header className="shrink-0 flex items-center justify-between gap-4 px-5 py-4 border-b border-[#E8E8E8] bg-white">
        {title && (
          <h2 className="proposal-display-font text-lg md:text-xl font-semibold text-[#1A1A1A] truncate flex-1 min-w-0">
            {title}
          </h2>
        )}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-sm font-medium tabular-nums px-2 py-1 rounded"
            style={{ color: PROPOSAL_ACCENT }}
            aria-live="polite"
          >
            {currentIndex + 1} / {total}
          </span>
          {showCloseButton && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-[#E8E8E8] flex items-center justify-center text-[#4A4A4A] hover:bg-[#F0EFED] hover:border-[#CBD5E1] transition-all duration-200"
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
          className="shrink-0 w-12 h-12 rounded-full border border-[#E8E8E8] bg-white flex items-center justify-center text-[#4A4A4A] hover:border-teal-500 hover:text-teal-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 hover:scale-105 my-auto mx-2"
          aria-label="Previous slide"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex-1 min-w-0 flex flex-col p-6 md:p-10 overflow-auto bg-[var(--proposal-canvas-bg,#F9F7F4)]">
          <div className="max-w-2xl mx-auto w-full">
            <div key={currentIndex} className="slide-content-in">
              <SlideTitleBar
                slideTitle={slide?.title ?? "Slide"}
                slideIndex={currentIndex}
                totalSlides={total}
                isCover={isCover}
                isThankYou={isThankYou}
              />
              <div
                className="rounded-xl p-8 border shadow-[0_2px_12px_rgba(0,0,0,0.06)] bg-white"
                style={{ borderColor: "#E8E8E8" }}
              >
                {isCover && (
                  <div className="flex justify-end mb-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Proposal
                    </span>
                  </div>
                )}
                <div className="space-y-0">
                  {isAddOns && addOnsBlocks.length > 0 ? (
                    <AddOnsSlideContent blocks={addOnsBlocks} />
                  ) : (
                    (slide?.blocks ?? []).map((block) => (
                      <SlideBlock key={block.id} block={block} />
                    ))
                  )}
                </div>
                {(!slide?.blocks || slide.blocks.length === 0) && !isAddOns && (
                  <p className="text-[#4A4A4A] text-sm">No content</p>
                )}
                {isCover && companyName && (
                  <p className="mt-8 pt-4 border-t border-[#F0F0F0] text-right text-sm italic text-[#4A4A4A]">
                    Prepared by {companyName}
                  </p>
                )}
                {isThankYou && (
                  <div className="mt-8 flex justify-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-teal-500">
                      <Check className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={currentIndex >= total - 1}
          className="shrink-0 w-12 h-12 rounded-full border border-[#E8E8E8] bg-white flex items-center justify-center text-[#4A4A4A] hover:border-teal-500 hover:text-teal-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 hover:scale-105 my-auto mx-2"
          aria-label="Next slide"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      <div className="shrink-0 flex items-center justify-center gap-2 py-4 border-t border-[#E8E8E8] bg-white">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            className={`cursor-pointer transition-all duration-250 ease-out ${
              i === currentIndex
                ? "h-2.5 bg-teal-500 rounded-full"
                : "w-2.5 h-2.5 rounded-full bg-[#CBD5E1] hover:bg-[#94a3b8]"
            }`}
            style={i === currentIndex ? { width: 28, backgroundColor: PROPOSAL_ACCENT } : { width: 10 }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
