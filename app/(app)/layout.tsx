import { AppShell } from "@/components/layout/AppShell";
import { CommandPalette } from "@/components/CommandPalette";
import { ContextMenuProvider } from "@/components/ContextMenuProvider";
import { WelcomeGate } from "@/components/welcome/WelcomeGate";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContextMenuProvider>
      <AppShell>
        <WelcomeGate>{children}</WelcomeGate>
      </AppShell>
      <CommandPalette />
    </ContextMenuProvider>
  );
}
