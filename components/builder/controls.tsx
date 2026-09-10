"use client";

import { cn } from "@/lib/utils";

const inputClass =
  "mt-1.5 w-full rounded-[10px] border border-black/10 bg-[#f5f5f7]/60 px-3 py-2 text-[14px] text-[#1d1d1f] placeholder:text-[#aeaeb2] transition-all duration-200 hover:bg-[#f5f5f7] focus:border-[#0071e3] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0071e3]/15";

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-[12px] font-medium text-[#6e6e73]">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-[12px] font-medium text-[#6e6e73]">{label}</span>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, "resize-y leading-relaxed")}
      />
      {helper && <span className="mt-1.5 block text-[12px] text-[#aeaeb2]">{helper}</span>}
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-[12px] font-medium text-[#6e6e73]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(inputClass, "cursor-pointer")}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}