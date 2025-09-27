/**
 * Colour engine.
 *
 * The user picks ONE colour per region (hair, eyes, skin, outfit...). Flat fills
 * of a single colour look like clip art, so every region expands that one pick
 * into a small ramp — deep shadow, base, highlight, rim light — plus a readable
 * outline. That derivation is what makes the generated art read as illustrated
 * rather than filled.
 */

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Accepts `#abc`, `#aabbcc`, and bare `aabbcc`. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let value = hex.trim().replace(/^#/, "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return { r: 0, g: 0, b: 0 };
  const int = parseInt(value, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (channel: number) =>
    Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToHsl(hex: string): Hsl {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  if (delta === 0) return { h: 0, s: 0, l: l * 100 };

  const s = delta / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / delta) % 6;
  else if (max === gn) h = (bn - rn) / delta + 2;
  else h = (rn - gn) / delta + 4;
  h *= 60;
  if (h < 0) h += 360;

  return { h, s: s * 100, l: l * 100 };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const hn = ((h % 360) + 360) % 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;

  let rgb: [number, number, number];
  if (hn < 60) rgb = [c, x, 0];
  else if (hn < 120) rgb = [x, c, 0];
  else if (hn < 180) rgb = [0, c, x];
  else if (hn < 240) rgb = [0, x, c];
  else if (hn < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return rgbToHex((rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255);
}

/** Nudge a colour in HSL space. Deltas are additive; lightness/saturation clamp. */
export function shift(hex: string, delta: Partial<Hsl>): string {
  const hsl = hexToHsl(hex);
  return hslToHex({
    h: hsl.h + (delta.h ?? 0),
    s: clamp(hsl.s + (delta.s ?? 0), 0, 100),
    l: clamp(hsl.l + (delta.l ?? 0), 0, 100),
  });
}

export function lighten(hex: string, amount: number): string {
  return shift(hex, { l: amount });
}

export function darken(hex: string, amount: number): string {
  return shift(hex, { l: -amount });
}

export function saturate(hex: string, amount: number): string {
  return shift(hex, { s: amount });
}

/** Linear RGB blend. `weight` is how much of `b` to mix in. */
export function mix(a: string, b: string, weight: number): string {
  const w = clamp(weight, 0, 1);
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex(
    ca.r + (cb.r - ca.r) * w,
    ca.g + (cb.g - ca.g) * w,
    ca.b + (cb.b - ca.b) * w,
  );
}

/** `rgba()` string for a hex + alpha. Needed because SVG gradients want stop-opacity. */
export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

/** Perceived luminance, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (c: number) => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Pick whichever of two inks reads better on `background`. */
export function readableInk(background: string, dark = "#0a0a12", light = "#f8fafc"): string {
  return luminance(background) > 0.45 ? dark : light;
}

/**
 * A full shading ramp derived from one base colour.
 *
 * Shadows rotate toward blue/violet and gain saturation (how skin and fabric
 * actually behave in shadow); highlights rotate toward the warm side and lose
 * saturation. Hue-shifting instead of simply darkening is the single biggest
 * quality difference in the rendered art.
 */
export interface Ramp {
  deepest: string;
  shadow: string;
  base: string;
  light: string;
  highlight: string;
  outline: string;
  rim: string;
  /**
   * Primary cel shadow — the single hard-edged shadow tone.
   *
   * Distinct from `shadow`, which is a gradient stop. Cel shading paints this as
   * a flat shape with a crisp boundary, so it has to be more saturated and more
   * hue-shifted than a smooth ramp step: a merely darker tone reads as a
   * gradient artefact, while a warmer-to-cooler shift reads as light.
   */
  cel: string;
  /** Secondary cel tone for occlusion (under the jaw, inside hair). */
  celDeep: string;
}

export function buildRamp(base: string, options?: { coolShadows?: boolean }): Ramp {
  const cool = options?.coolShadows ?? true;
  const shadowHue = cool ? -14 : 10;
  const { l } = hexToHsl(base);

  // Very dark bases have no room to go darker, so shift the ramp upward.
  const bias = l < 22 ? 12 : l < 34 ? 6 : 0;

  return {
    deepest: shift(base, { h: shadowHue * 1.6, s: 10, l: -26 + bias * 1.4 }),
    shadow: shift(base, { h: shadowHue, s: 6, l: -15 + bias }),
    base: bias > 0 ? lighten(base, bias * 0.4) : base,
    light: shift(base, { h: -shadowHue * 0.4, s: -4, l: 11 }),
    highlight: shift(base, { h: -shadowHue * 0.8, s: -14, l: 24 }),
    outline: shift(base, { h: shadowHue * 2, s: 14, l: -34 + bias * 1.8 }),
    rim: shift(base, { h: -shadowHue, s: 16, l: 20 }),
    cel: shift(base, { h: shadowHue * 0.9, s: 13, l: -18 + bias }),
    celDeep: shift(base, { h: shadowHue * 1.5, s: 17, l: -29 + bias * 1.3 }),
  };
}

/**
 * Skin wants its own ramp: warmer, lower contrast, never fully desaturated.
 *
 * The cel tone rotates toward red-violet rather than simply darkening, which is
 * how skin actually behaves in shadow and what stops anime-style flats from
 * looking grey and dead.
 */
export function buildSkinRamp(base: string): Ramp {
  return {
    deepest: shift(base, { h: -16, s: 16, l: -22 }),
    shadow: shift(base, { h: -9, s: 11, l: -11 }),
    base,
    light: shift(base, { h: 4, s: -3, l: 6 }),
    highlight: shift(base, { h: 8, s: -8, l: 13 }),
    outline: shift(base, { h: -18, s: 20, l: -32 }),
    rim: shift(base, { h: -24, s: 24, l: 8 }),
    cel: shift(base, { h: -12, s: 19, l: -14 }),
    celDeep: shift(base, { h: -18, s: 23, l: -25 }),
  };
}

/** Deterministic, pleasant colour for arbitrary labels (universe crests, tags). */
export function hueFromLabel(label: string, saturation = 62, lightness = 58): string {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) % 360;
  }
  return hslToHex({ h: hash, s: saturation, l: lightness });
}
