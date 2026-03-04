import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle showLabel={false} />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
