"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsContextValue {
  activeId: string;
  setActiveId: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within Tabs");
  return ctx;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab = tabs[0]?.id ?? "", className = "" }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeId, setActiveId }}>
      <div className={className}>
        <div className="flex border-b border-[var(--border)] gap-1 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-[var(--transition)] border-b-2 -mb-px ${
                activeId === tab.id
                  ? "border-[var(--accent-green)] text-[var(--accent-green)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="animate-in fade-in duration-150">
          {tabs.find((t) => t.id === activeId)?.content}
        </div>
      </div>
    </TabsContext.Provider>
  );
}
