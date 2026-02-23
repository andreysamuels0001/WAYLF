import { matchCharacter } from "@/lib/quiz/match";
import { QUIZ, isComplete, type QuizAnswers } from "@/lib/quiz/questions";
import { resultFromToken, sealResult } from "@/lib/quiz/result";

/**
 * Quiz resolution.
 *
 * Deliberately a server route rather than client-side logic: the answer→character
 * scoring table must not ship to the browser, or the outcome could be read
 * straight out of the bundle.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  let answers: unknown;
  try {
    ({ answers } = (await request.json()) as { answers?: unknown });
  } catch {
    return Response.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  if (typeof answers !== "object" || answers === null) {
    return Response.json({ error: "Missing answers." }, { status: 400 });
  }

  // Only known question/option pairs survive — an unexpected key cannot reach
  // the matcher and skew the outcome.
  const clean: QuizAnswers = {};
  for (const question of QUIZ) {
    const value = (answers as Record<string, unknown>)[question.id];
    if (typeof value !== "string") continue;
    if (question.options.some((option) => option.id === value)) clean[question.id] = value;
  }

  if (!isComplete(clean)) {
    const missing = QUIZ.filter((question) => !clean[question.id]).map((q) => q.id);
    return Response.json({ error: "Some questions are unanswered.", missing }, { status: 400 });
  }

  const match = matchCharacter(clean);

  const token = sealResult({
    v: 2,
    id: match.character.id,
    affinity: match.affinity,
    readings: match.readings,
    drivers: match.drivers,
  });

  return Response.json({
    character: match.character,
    rank: match.rank,
    rarity: match.rarity,
    affinity: match.affinity,
    readings: match.readings,
    drivers: match.drivers,
    token,
  });
}

/** Re-opens a sealed result for a shared link. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t");
  if (!token) return Response.json({ error: "Missing token." }, { status: 400 });

  const result = resultFromToken(token);
  if (!result) {
    return Response.json(
      { error: "That result link is invalid or has been altered." },
      { status: 400 },
    );
  }
  return Response.json(result);
}
