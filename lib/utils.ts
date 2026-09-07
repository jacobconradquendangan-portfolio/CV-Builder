export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Rough perceived luminance of a hex color — used to pick readable ink on accent backgrounds. */
export function isLightColor(hex: string): boolean {
  const value = hex.replace("#", "");
  if (value.length !== 6) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}

/**
 * Accent color to use for text/drawings on a white surface.
 * When the accent itself is light (e.g. white), falls back to a dark slate so
 * content never becomes invisible; otherwise returns the accent unchanged.
 */
export function accentFg(accent: string): string {
  return isLightColor(accent) ? "#1e293b" : accent;
}