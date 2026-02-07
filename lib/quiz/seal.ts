import "server-only";

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * Sealed quiz results.
 *
 * Results are encrypted with AES-256-GCM before they leave the server, and the
 * token is what goes in a share URL. GCM is authenticated, so a tampered token
 * fails to open rather than decoding into something attacker-chosen — which is
 * what stops someone editing their share link to claim a Mythic.
 *
 * What this protects: result integrity, and the answer→character mapping (which
 * lives in `resolve.ts` and never ships to the browser). What it cannot protect
 * is the card currently on screen — the client has to receive that in order to
 * draw it. Encryption here is about forgery and the outcome table, not hiding a
 * card from the person looking at it.
 */

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;

const DEV_SECRET = "animaforge-development-secret-do-not-use-in-production";
let warned = false;

function secret(): string {
  const configured = process.env.QUIZ_SECRET;
  if (configured && configured.length >= 16) return configured;

  if (process.env.NODE_ENV === "production" && !warned) {
    warned = true;
    console.warn(
      "[quiz] QUIZ_SECRET is not set. Falling back to a public development key — " +
        "share tokens are forgeable until you set it.",
    );
  }
  return configured || DEV_SECRET;
}

function key(): Buffer {
  // scrypt stretches an arbitrary passphrase into a real 32-byte key.
  return scryptSync(secret(), "animaforge.quiz.v1", 32);
}

export function seal(payload: unknown): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key(), iv);
  const body = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, body, cipher.getAuthTag()]).toString("base64url");
}

export function open<T>(token: string): T | null {
  try {
    const raw = Buffer.from(token, "base64url");
    if (raw.length <= IV_BYTES + TAG_BYTES) return null;

    const iv = raw.subarray(0, IV_BYTES);
    const tag = raw.subarray(raw.length - TAG_BYTES);
    const body = raw.subarray(IV_BYTES, raw.length - TAG_BYTES);

    const decipher = createDecipheriv(ALGORITHM, key(), iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
    return JSON.parse(plain) as T;
  } catch {
    // Wrong key, truncated token, or tampered ciphertext all land here.
    return null;
  }
}
