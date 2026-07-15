import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { navItems } from "@/lib/navigation";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Minimal, neutral layout shell for Stage 0 (project foundation).
 * Deliberately plain: system font, black/white/grey, standard spacing,
 * no animation, no imagery, no branding. The premium design system
 * arrives in a later stage and will replace this shell's styling.
 */
export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4">
          <span className="text-sm font-semibold tracking-wide text-neutral-900">
            THE ONE MOVEMENT INTERNATIONAL
          </span>
          <nav aria-label="Primary" className="-mx-1 flex flex-wrap gap-x-4 gap-y-2">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={
                    "px-1 text-sm " +
                    (isActive
                      ? "font-medium text-neutral-900 underline"
                      : "text-neutral-600 hover:text-neutral-900")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; The One Movement International</span>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-neutral-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-neutral-900">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
