import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-abyss/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              Sixteen questions about how you actually are, matched against the 500
              most-loved characters in anime.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                Explore
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/studio" className="text-ink-muted transition-colors hover:text-ink">
                    Studio
                  </Link>
                </li>
                <li>
                  <Link href="/roster" className="text-ink-muted transition-colors hover:text-ink">
                    The deck
                  </Link>
                </li>
                <li>
                  <Link href="/collection" className="text-ink-muted transition-colors hover:text-ink">
                    My collection
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                Genres
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="text-ink-faint">Coming soon</li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
                About the data
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Character data and artwork come from AniList. All artwork remains the
                property of its respective rights holders; this is a fan project and is
                not affiliated with or endorsed by them.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AnimaForge.</p>
          <p className="font-mono">Data via AniList · no account · instant</p>
        </div>
      </div>
    </footer>
  );
}
