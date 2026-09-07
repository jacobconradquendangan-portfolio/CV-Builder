"use client";

import { useRef, useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";

const MAX_DIMENSION = 640;
const JPEG_QUALITY = 0.85;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function downscaleImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    readFileAsDataURL(file)
      .then((dataUrl) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
          const width = Math.max(1, Math.round(img.width * scale));
          const height = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          // JPEG has no alpha channel — fill white so transparent images don't turn black.

          const useJpeg = !file.type.endsWith("png");
          if (useJpeg) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(useJpeg ? "image/jpeg" : "image/png", useJpeg ? JPEG_QUALITY : undefined));
        };
        img.onerror = () => reject(new Error("Could not decode image"));
        img.src = dataUrl;
      })
      .catch((error) => reject(error));
  });
}

export function PhotoUploader() {
  const photo = useResumeStore((state) => state.data.personal.photo ?? "");
  const setPersonal = useResumeStore((state) => state.setPersonal);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file. (JPG, PNG, or WebP)");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Image is too large — please pick one under 10 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const dataUrl = await downscaleImage(file);
      setPersonal({ photo: dataUrl });
    } catch {
      setError("Could not read that image. Please try another file.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="mt-3 flex items-start gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      {photo ? (
        // Uploaded photos are local data: URLs that can't use next/image.

        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt="Profile photo preview"
          className="h-20 w-20 shrink-0 rounded-full border border-slate-200 object-cover shadow-sm"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-white text-slate-300">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0" />
            <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
          </svg>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Processing…" : photo ? "Replace photo" : "Upload photo"}
          </button>
          {photo && (
            <button
              type="button"
              onClick={() => {
                setPersonal({ photo: "" });
                setError("");
              }}
              className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        <label className="mt-2.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Photo URL (optional)
        </label>
        <input
          type="url"
          value={photo.startsWith("data:") ? "" : photo}
          onChange={(event) => setPersonal({ photo: event.target.value })}
          placeholder="https://example.com/photo.jpg"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        {error && <p className="mt-1.5 text-[11px] font-medium text-rose-600">{error}</p>}
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
          Uploads are resized (max 640 px) and saved with your resume — your photos never leave the browser.
        </p>
      </div>
    </div>
  );
}