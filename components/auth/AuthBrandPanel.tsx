"use client";

import { Check } from "lucide-react";

const FEATURES = [
  "AI blueprints",
  "Task management",
  "Time tracking",
  "Invoicing",
];

export function AuthBrandPanel() {
  return (
    <div className="relative min-h-screen bg-[#0c1628] border-t-4 border-teal-500 flex flex-col justify-center px-10 py-12 overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center mb-6">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-teal-400"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white font-mono">DevBlueprint</h1>
        <p className="text-sm text-neutral-400 mt-2 leading-relaxed max-w-sm">
          Plan, track, and invoice your dev projects — all in one place.
        </p>
        <ul className="mt-8 space-y-3">
          {FEATURES.map((label) => (
            <li key={label} className="flex items-center gap-2.5 text-sm text-neutral-300">
              <Check className="w-4 h-4 text-teal-400 shrink-0" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
