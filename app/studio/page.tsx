import type { Metadata } from "next";
import { QuizFlow } from "@/components/quiz/QuizFlow";
import { resultFromToken } from "@/lib/quiz/result";

export const metadata: Metadata = {
  title: "Find your character",
  description:
    "Sixteen questions about your habits, instincts and colours — matched against the 500 most-loved characters in anime.",
};

export default async function StudioPage({ searchParams }: PageProps<"/studio">) {
  const params = await searchParams;
  const token = typeof params.r === "string" ? params.r : undefined;
  const autoStart = params.start === "1";

  // A shared result is opened on the server, so the page renders the real card
  // on first paint instead of flashing the intro and then swapping.
  const restored = token ? resultFromToken(token) : null;

  return (
    <QuizFlow
      initialResult={restored}
      initialError={token && !restored ? "That result link is invalid or has been altered." : null}
      autoStart={autoStart}
    />
  );
}
