import { cn } from "@/lib/cn";

/**
 * WAYLF wordmark.
 *
 * The mark is a magnifying lens over a card — "who are you looking for" is a
 * search, and the deck is what you are searching. Drawn rather than imported so
 * it inherits the page's colour tokens and needs no asset request.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 32 32"
        className="size-8 shrink-0"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waylfMark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff8a6e" />
            <stop offset="48%" stopColor="#ff5a3c" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        {/* Card behind the lens */}
        <rect
          x="5.5"
          y="3.5"
          width="16"
          height="22"
          rx="3"
          fill="url(#waylfMark)"
          opacity="0.9"
        />
        <rect x="8" y="6" width="11" height="12" rx="1.5" fill="rgb(6 6 13 / 0.55)" />
        {/* Lens */}
        <circle
          cx="19.5"
          cy="17.5"
          r="7"
          fill="rgb(6 6 13 / 0.78)"
          stroke="#ffd166"
          strokeWidth="2.2"
        />
        <path
          d="M24.6 22.6 L29 27"
          stroke="#ffd166"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="17.2" cy="15.2" r="2" fill="rgb(255 209 102 / 0.4)" />
      </svg>
      {compact ? null : (
        <span className="font-display text-[1.0625rem] font-extrabold tracking-tight text-ink">
          WAY<span className="text-flare">LF</span>
        </span>
      )}
    </span>
  );
}
