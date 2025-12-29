"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/studio", label: "Studio" },
  { href: "/roster", label: "Roster" },
  { href: "/collection", label: "Collection" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-void/85 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-violet">
          <Logo className="transition-transform duration-300 group-hover:scale-[1.03]" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {link.label}
                {active ? (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-flare to-transparent" />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/studio?start=1"
            className="group hidden items-center gap-2 rounded-full bg-gradient-to-r from-flare to-rose px-4 py-2 text-sm font-semibold text-void shadow-lift transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] sm:inline-flex"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Find your character
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:text-ink md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-line bg-abyss/95 px-4 pb-4 pt-2 backdrop-blur-xl md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-3 text-base font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/studio"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-flare to-rose px-4 py-3 text-sm font-semibold text-void"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Find your character
          </Link>
        </div>
      ) : null}
    </header>
  );
}
