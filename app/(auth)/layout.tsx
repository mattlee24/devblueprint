import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid md:grid-cols-2 min-h-screen">
      <div className="hidden md:block">
        <AuthBrandPanel />
      </div>
      <div className="bg-white flex items-center justify-center p-4 md:p-0">
        <div className="w-full max-w-md px-6 md:px-10 py-8 md:py-12">
          <h1 className="text-2xl font-bold font-mono text-neutral-900 md:hidden mb-2">DevBlueprint</h1>
          <p className="text-sm text-neutral-500 md:hidden mb-6">Plan, track, and invoice your dev projects.</p>
          {children}
        </div>
      </div>
    </div>
  );
}
