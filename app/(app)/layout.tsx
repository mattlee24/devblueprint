import { AppShell } from "@/components/layout/AppShell";
import { CommandPalette } from "@/components/CommandPalette";
import { ContextMenuProvider } from "@/components/ContextMenuProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContextMenuProvider>
      <AppShell>{children}</AppShell>
      <CommandPalette />
    </ContextMenuProvider>
  );
}
