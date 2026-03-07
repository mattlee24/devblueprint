import { type ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/** Wraps page content: max-width 6xl, consistent padding, centered. */
export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div
      className={`mx-auto flex flex-col justify-center w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-8 pb-6 ${className}`}
    >
      {children}
    </div>
  );
}
