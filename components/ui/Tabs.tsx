"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({
  tabs,
  defaultTab = tabs[0]?.id ?? "",
  className = "",
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultTab}
      className={className}
    >
      <TabsPrimitive.List className="flex border-b border-[var(--border)] gap-1 mb-4 rounded-t-[var(--radius-sm)]">
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.id}
            value={tab.id}
            className="px-4 py-2 text-sm font-medium transition-[var(--transition)] border-b-2 -mb-px cursor-pointer rounded-t-[var(--radius-sm)] data-[state=active]:border-[var(--accent)] data-[state=active]:text-[var(--accent)] border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.id}
          value={tab.id}
          className="outline-none data-[state=inactive]:hidden"
        >
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
