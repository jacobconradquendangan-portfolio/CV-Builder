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

          const normalizedType = file.type.toLowerCase();
          const useJpeg = normalizedType === "image/jpeg" || normalizedType === "image/webp";
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
    <div className="mt-4 flex items-start gap-4 rounded-2xl bg-[#f5f5f7] p-4">
      {photo ? (
        // Uploaded photos are local data: URLs that can't use next/image.

        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt="Profile photo preview"
          className="h-20 w-20 shrink-0 rounded-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.12)] ring-1 ring-black/10"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-black/15 bg-white text-[#aeaeb2]">
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
            className="rounded-full bg-[#0071e3] px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(0,113,227,0.3)] transition-all duration-200 hover:bg-[#0077ed] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
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
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-[#d70015] transition-colors hover:bg-[#ff3b30]/10"
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

        <label className="mt-3 block text-[12px] font-medium text-[#6e6e73]">
          Photo URL (optional)
        </label>
        <input
          type="url"
          value={photo.startsWith("data:") ? "" : photo}
          onChange={(event) => setPersonal({ photo: event.target.value })}
          placeholder="https://example.com/photo.jpg"
          className="mt-1.5 w-full rounded-[10px] border border-black/10 bg-white px-3 py-2 text-[14px] text-[#1d1d1f] placeholder:text-[#aeaeb2] transition-all duration-200 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/15"
        />
        {error && <p className="mt-1.5 text-[12px] font-medium text-[#d70015]">{error}</p>}
        <p className="mt-1.5 text-[12px] leading-relaxed text-[#aeaeb2]">
          Uploads are resized (max 640 px) and saved with your resume — your photos never leave the browser.
        </p>
      </div>
    </div>
  );
}