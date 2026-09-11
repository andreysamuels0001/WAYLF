"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ArrowLeft, Heart, Link2, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import { CardReveal } from "./CardReveal";
import { cn } from "@/lib/cn";
import { luminance, withAlpha } from "@/lib/color";
import { useCollection } from "@/lib/collection";
import type { DeckCharacter } from "@/lib/deck";
import { QUIZ, type QuizAnswers } from "@/lib/quiz/questions";
import { RARITY_BY_ID } from "@/lib/rarity";
import type { RarityId } from "@/lib/types";

export interface QuizResponse {
  character: DeckCharacter;
  rank: number;
  rarity: RarityId;
  affinity: number;
  readings: string[];
  drivers: string[];
  token: string;
}

type Phase = "intro" | "asking" | "resolving" | "result";

export interface QuizFlowProps {
  /** A sealed result restored from a share link, opened on the server. */
  initialResult?: QuizResponse | null;
  initialError?: string | null;
  /** Skip the intro and open on question one — used by "take the quiz" links. */
  autoStart?: boolean;
}

export function QuizFlow({
  initialResult = null,
  initialError = null,
  autoStart = false,
}: QuizFlowProps) {
  const [phase, setPhase] = useState<Phase>(
    initialResult ? "result" : autoStart ? "asking" : "intro",
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [result, setResult] = useState<QuizResponse | null>(initialResult);
  const [error, setError] = useState<string | null>(initialError);
  const [notice, setNotice] = useState<string | null>(null);

  const { save, has } = useCollection();

  const question = QUIZ[index];
  const progress = (index / QUIZ.length) * 100;
  const saved = result ? has(result.character.id) : false;

  const submit = useCallback(async (finalAnswers: QuizAnswers) => {
    setPhase("resolving");
    setError(null);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error ?? "Could not read your answers.");

      setResult(body as QuizResponse);
      setPhase("result");

      const url = new URL(window.location.href);
      url.searchParams.set("r", (body as QuizResponse).token);
      window.history.replaceState(null, "", url.toString());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
      setPhase("asking");
    }
  }, []);

  const choose = useCallback(
    (optionId: string) => {
      const next = { ...answers, [question.id]: optionId };
      setAnswers(next);
      if (index + 1 < QUIZ.length) setIndex(index + 1);
      else void submit(next);
    },
    [answers, index, question, submit],
  );

  const restart = useCallback(() => {
    setAnswers({});
    setIndex(0);
    setResult(null);
    setError(null);
    setPhase("asking");
    const url = new URL(window.location.href);
    url.searchParams.delete("r");
    window.history.replaceState(null, "", url.toString());
  }, []);

  const flash = useCallback((message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 3000);
  }, []);

  if (phase === "intro") return <Intro onStart={() => setPhase("asking")} />;
  if (phase === "resolving") return <Resolving />;

  if (phase === "result" && result) {
    const tier = RARITY_BY_ID[result.rarity];
    const accent = result.character.palette[1] ?? result.character.palette[0] ?? tier.glow;
    const ink = luminance(tier.glow) > 0.5 ? "#0a0a12" : "#ffffff";

    return (
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <CardReveal
              character={result.character}
              rarity={result.rarity}
              rank={result.rank}
              affinity={result.affinity}
            />
          </div>

          <div className="animate-reveal-rise" style={{ animationDelay: "1.35s" }}>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.22em]"
                style={{ background: tier.glow, color: ink }}
              >
                {tier.label}
              </span>
              <span
                className="rounded-full px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.18em]"
                style={{ background: withAlpha(accent, 0.2), color: accent }}
              >
                {result.affinity}% match
              </span>
            </div>

            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              {result.character.name}
            </h1>
            {result.character.native ? (
              <p className="mt-1 text-xl text-ink-faint">{result.character.native}</p>
            ) : null}
            <p className="mt-3 text-sm text-ink-muted">
              from <span className="font-semibold text-ink">{result.character.series}</span>
              {result.character.year ? ` · ${result.character.year}` : ""}
            </p>

            {result.character.description ? (
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-ink-muted">
                {result.character.description}
              </p>
            ) : null}

            <ul
              className="mt-8 space-y-3 border-l-2 pl-5"
              style={{ borderColor: withAlpha(accent, 0.4) }}
            >
              {result.readings.map((reading, i) => (
                <li key={i} className="text-sm leading-relaxed text-ink-muted">
                  {reading}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                  flash("Share link copied.");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-5 py-3 text-sm font-semibold text-ink-muted transition-colors hover:border-line-bright hover:text-ink"
              >
                <Link2 className="size-4" />
                Share
              </button>
              <button
                type="button"
                onClick={() => {
                  save(result.character.id);
                  flash(`${result.character.name} saved.`);
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors",
                  saved
                    ? "border-rose/50 bg-rose/10 text-rose"
                    : "border-line bg-surface-2 text-ink-muted hover:border-line-bright hover:text-ink",
                )}
              >
                <Heart className={cn("size-4", saved && "fill-current")} />
                {saved ? "Saved" : "Save"}
              </button>
              <a
                href={result.character.image}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-5 py-3 text-sm font-semibold text-ink-muted transition-colors hover:border-line-bright hover:text-ink"
              >
                View artwork
              </a>
            </div>

            <p className="mt-3 min-h-5 text-xs text-jade" role="status" aria-live="polite">
              {notice}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-5 border-t border-line pt-6">
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
              >
                <RotateCcw className="size-4" />
                Take it again
              </button>
              <Link
                href="/roster"
                className="text-sm font-semibold text-flare transition-colors hover:text-flare-soft"
              >
                Browse all 500 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
      <div className="mb-8">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-flare">
            {question.category}
          </span>
          <span className="font-mono text-xs text-ink-faint">
            {index + 1} / {QUIZ.length}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-flare to-rose transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(progress, 3)}%` }}
          />
        </div>
      </div>

      <div key={question.id} className="animate-reveal-rise">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-balance text-ink sm:text-3xl">
          {question.prompt}
        </h2>
        {question.caption ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{question.caption}</p>
        ) : null}

        <div
          className={cn(
            "mt-7 grid gap-3",
            question.kind === "colour" ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-2",
          )}
        >
          {question.options.map((option) =>
            question.kind === "colour" ? (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option.id)}
                className="group relative overflow-hidden rounded-xl border border-line bg-surface p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-line-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
              >
                <span
                  className="block h-14 w-full rounded-lg ring-hairline transition-transform duration-300 group-hover:scale-[1.04]"
                  style={{ background: option.swatch }}
                />
                <span className="mt-2 block truncate text-xs font-semibold text-ink">
                  {option.label}
                </span>
              </button>
            ) : (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option.id)}
                className="group relative overflow-hidden rounded-xl border border-line bg-surface px-4 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-flare/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet"
              >
                <span className="flex items-start gap-3">
                  {option.glyph ? (
                    <span className="mt-0.5 text-xl leading-none" aria-hidden>
                      {option.glyph}
                    </span>
                  ) : null}
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{option.label}</span>
                    {option.hint ? (
                      <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                        {option.hint}
                      </span>
                    ) : null}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-flare to-transparent transition-transform duration-300 group-hover:scale-x-100"
                />
              </button>
            ),
          )}
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-lg border border-flare/40 bg-flare/10 px-4 py-3 text-sm text-flare">
          {error}
        </p>
      ) : null}

      {index > 0 ? (
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          className="mt-8 inline-flex items-center gap-2 text-sm text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Previous question
        </button>
      ) : null}
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-10 text-center sm:px-6">
      <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        <Sparkles className="size-3.5 text-flare" />
        {QUIZ.length} questions · 500 characters
      </p>

      <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance text-ink sm:text-5xl">
        Who are you
        <span className="block bg-gradient-to-r from-flare via-rose to-violet bg-clip-text text-transparent">
          looking for?
        </span>
      </h1>

      <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-pretty text-ink-muted">
        Sixteen questions about your habits, instincts and colours — matched against the
        500 most-loved characters in anime. Then your card is revealed.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-flare to-rose px-8 py-4 text-sm font-bold text-void shadow-lift transition-transform duration-200 hover:scale-[1.04] active:scale-[0.99]"
      >
        <Wand2 className="size-4" />
        Begin
      </button>

      <p className="mt-6 text-xs text-ink-faint">
        No account. Nothing uploaded. Your result is sealed and shareable.
      </p>
    </div>
  );
}

function Resolving() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-28 text-center">
      <div className="relative size-24">
        <span className="absolute inset-0 animate-ping rounded-full bg-flare/30" />
        <span className="absolute inset-2 animate-pulse rounded-full bg-gradient-to-br from-flare to-violet blur-md" />
        <span className="absolute inset-0 grid place-items-center">
          <Sparkles className="size-8 text-ink" />
        </span>
      </div>
      <h2 className="mt-8 font-display text-xl font-bold text-ink">Searching 500 characters…</h2>
      <p className="mt-2 text-sm text-ink-muted">Matching genre, theme and palette.</p>
    </div>
  );
}
