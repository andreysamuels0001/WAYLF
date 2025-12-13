import { cn } from "@/lib/cn";

/** Wordmark + sigil. */
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
          <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff8a6e" />
            <stop offset="48%" stopColor="#ff5a3c" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <path
          d="M16 1.5 L29 16 L16 30.5 L3 16 Z"
          fill="url(#logoGrad)"
          stroke="rgb(255 255 255 / 0.25)"
          strokeWidth="1"
        />
        <path d="M16 6.5 L24.5 16 L16 25.5 L7.5 16 Z" fill="rgb(6 6 13 / 0.55)" />
        <path d="M16 10 L21 16 L16 22 L11 16 Z" fill="#ffd166" />
      </svg>
      {compact ? null : (
        <span className="font-display text-[1.0625rem] font-extrabold tracking-tight text-ink">
          Anima<span className="text-flare">Forge</span>
        </span>
      )}
    </span>
  );
}
