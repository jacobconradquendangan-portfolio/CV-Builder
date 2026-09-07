import { cn } from "@/lib/utils";

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

export function DateRange({
  start,
  end,
  className,
}: {
  start?: string;
  end?: string;
  className?: string;
}) {
  const from = prettyDate(start);
  const to = prettyDate(end) || "Present";
  if (!from && !to) return null;
  return <span className={className}>{`${from || "—"} – ${to}`}</span>;
}

export function BulletList({
  text,
  textClassName,
  dotClassName,
}: {
  text: string;
  textClassName?: string;
  dotClassName?: string;
}) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <ul className="mt-1.5 space-y-1">
      {lines.map((line, index) => (
        <li key={index} className="flex gap-2 leading-relaxed">
          <span className={cn("mt-[6px] h-1 w-1 shrink-0 rounded-full", dotClassName ?? "bg-current opacity-60")} />
          <span className={textClassName}>{line}</span>
        </li>
      ))}
    </ul>
  );
}

/** Renders a circular profile photo — returns null when no photo is set. */
export function Photo({ src, className }: { src?: string; className?: string }) {
  if (!src || !src.trim()) return null;
  return (
    // A plain img is required here: resume photos can be local data: URLs
    // (uploaded files) that next/image cannot serve or optimize.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={cn("rounded-full object-cover", className)}
      onError={(event) => {
        event.currentTarget.style.visibility = "hidden";
      }}
    />
  );
}