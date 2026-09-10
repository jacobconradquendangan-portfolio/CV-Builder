export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** A4 height in CSS pixels at 96dpi (794 x 1123). Single source of truth for page math. */
export const A4_PAGE_HEIGHT = 1123;
/** Vertical padding on the resume root (py-12 => 48px top + 48px bottom). */
export const PAGE_PADDING = 48;
/** Printed page height once the repeated top/bottom gutter is accounted for. */
export const PRINTED_PAGE_HEIGHT = A4_PAGE_HEIGHT - PAGE_PADDING * 2;

/**
 * How many A4 pages the resume occupies when printed.
 * Counts full A4 pages as they truly land on the page; adding the vertical
 * padding back in here creates a phantom blank second page when the resume
 * reaches the exact page height.
 */
export function estimatePageCount(contentHeight: number): number {
  if (!Number.isFinite(contentHeight) || contentHeight <= 0) return 1;
  return Math.max(1, Math.ceil(contentHeight / A4_PAGE_HEIGHT));
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Formats "YYYY-MM" / "YYYY" inputs as "Mon YYYY" / "YYYY"; passes anything else through. */
export function prettyDate(value?: string): string {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (/^\d{4}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{4})-(\d{1,2})$/);
  if (match) {
    const monthIndex = Number(match[2]) - 1;
    if (monthIndex >= 0 && monthIndex < 12) return `${MONTHS[monthIndex]} ${match[1]}`;
  }
  return raw;
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