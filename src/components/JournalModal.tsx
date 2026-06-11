"use client";

import { useEffect, useRef } from "react";
import { X, Clock, ChevronDown, ChevronUp } from "lucide-react";
import type { JournalEntryRow } from "@/lib/data";
import { getTimeFormat } from "@/lib/settings";

interface JournalModalProps {
  entry: JournalEntryRow | null;
  onClose: () => void;
}

const categoryStyles: Record<string, { label: string; color: string }> = {
  shipped: { label: "shipped", color: "border-black bg-black text-white" },
  engineered: { label: "engineered", color: "border-black bg-black text-white" },
  exploring: { label: "exploring", color: "border-black bg-black text-white" },
  thinking: { label: "thinking", color: "border-black bg-black text-white" },
};

function formatPublished(publishedAt: string): { date: string; time: string; day: string } {
  const d = new Date(publishedAt);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const hour12 = getTimeFormat() === "12h";
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12 });
  const day = d.toLocaleDateString("en-US", { weekday: "long" });
  return { date, time, day };
}

export default function JournalModal({ entry, onClose }: JournalModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (entry) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [entry]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const scrollContent = (direction: "up" | "down") => {
    if (contentRef.current) {
      const amount = 200;
      contentRef.current.scrollBy({
        top: direction === "down" ? amount : -amount,
        behavior: "smooth",
      });
    }
  };

  if (!entry) return null;

  const contentParagraphs = (entry.content || "").split("\n").filter(Boolean);

  const cat = categoryStyles[entry.category] || categoryStyles.shipped;
  const pub = formatPublished(entry.published_at);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

      {/* Modal — white card style matching JournalCard */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-neutral-200/80 animate-fade-in-center bg-white shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-black hover:text-white transition-all duration-200 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-8">
          {/* Category + Date — same style as card */}
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-block text-[10px] md:text-xs font-mono uppercase rounded-full px-2.5 py-1 border ${cat.color}`}>
              {cat.label}
            </span>
            <span className="text-[10px] md:text-xs text-black font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {pub.date}
            </span>
          </div>

          {/* Published line — same as card */}
          <p className="text-[11px] md:text-xs text-black font-mono mb-4 uppercase tracking-wider">
            Published {pub.day}, {pub.time}
          </p>

          {/* Title — same bold style */}
          <h3 className="text-sm md:text-base font-bold text-neutral-900 leading-snug mb-3 break-words">
            {entry.title}
          </h3>

          {/* Summary — full text (no truncation) */}
          <p className="text-xs md:text-sm text-neutral-900 leading-relaxed mb-3">
            {entry.summary}
          </p>

          {/* Author — same as card */}
          <p className="text-[10px] md:text-xs font-mono mb-5 text-black">
            - Enoch Chukwudi
          </p>

          {/* Divider */}
          <div className="h-px bg-neutral-200 mb-5" />

          {/* Full content — scrollable area */}
          <div className="relative">
            <div
              ref={contentRef}
              className="mb-5 max-h-[50vh] overflow-y-auto pr-2 scroll-smooth"
              style={{ scrollbarWidth: "thin" }}
            >
              <p className="text-[10px] md:text-xs font-semibold font-mono uppercase tracking-[0.15em] text-black mb-2">
                Full Entry
              </p>
              <div className="space-y-4">
                {contentParagraphs.map((p, i) => (
                  <p key={i} className="text-xs md:text-sm text-neutral-900 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </div>

            {/* Scroll buttons */}
            <div className="flex items-center justify-center gap-3 py-2 border-t border-neutral-200">
              <button
                onClick={() => scrollContent("up")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-200 cursor-pointer"
                title="Scroll up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                Scroll up
              </button>
              <button
                onClick={() => scrollContent("down")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-200 cursor-pointer"
                title="Scroll down"
              >
                Scroll down
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}