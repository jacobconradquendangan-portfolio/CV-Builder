import type { CSSProperties } from "react";
import { cn, normalizeExternalUrl, prettyDate } from "@/lib/utils";

// Re-exported for backwards compatibility (older imports resolve via primitives).
export { prettyDate };

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

export function ResumeLink({
  url,
  label,
  className,
}: {
  url: string;
  label: string;
  className?: string;
}) {
  const href = normalizeExternalUrl(url);
  if (!href) return <span className={className}>{label}</span>;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  );
}

export function ContactLinks({
  parts,
  separator,
  className,
}: {
  parts: Array<{ label: string; url?: string }>;
  separator: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {parts.map((part, index) => (
        <span key={`${part.label}-${index}`}>
          {index > 0 && separator}
          {part.url ? <ResumeLink url={part.url} label={part.label} /> : part.label}
        </span>
      ))}
    </span>
  );
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
          <span className={cn("mt-1.5 h-1 w-1 shrink-0 rounded-full", dotClassName ?? "bg-current opacity-60")} />
          <span className={textClassName}>{line}</span>
        </li>
      ))}
    </ul>
  );
}

/** Renders a circular profile photo — returns null when no photo is set. */
export function Photo({ src, className, style }: { src?: string; className?: string; style?: CSSProperties }) {
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
      style={style}
      onError={(event) => {
        event.currentTarget.style.visibility = "hidden";
      }}
    />
  );
}