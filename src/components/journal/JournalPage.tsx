"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchJournalEntries, type JournalEntryRow } from "@/lib/data/index";
import { ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";
import JournalModal from "./JournalModal";
import { getTimeFormat } from "@/lib/settings/index";
import { useInView } from "@/hooks/useInView";
import { usePerPage } from "@/hooks/usePerPage";

const PER_PAGE = 8;

const categoryStyles: Record<string, { label: string; color: string }> = {
  updates: { label: "updates", color: "border-black bg-black text-white" },
  progress: { label: "progress", color: "border-black bg-black text-white" },
  shipped: { label: "shipped", color: "border-black bg-black text-white" },
  modification: { label: "modification", color: "border-black bg-black text-white" },
  research: { label: "research", color: "border-black bg-black text-white" },
  architecture: { label: "architecture", color: "border-black bg-black text-white" },
};

function formatPublished(publishedAt: string): { date: string; time: string; day: string } {
  const d = new Date(publishedAt);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const hour12 = getTimeFormat() === "12h";
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12 });
  const day = d.toLocaleDateString("en-US", { weekday: "long" });
  return { date, time, day };
}

function truncate(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

function JournalCard({ entry, index, visible, isLatest, number, onSelect }: { entry: JournalEntryRow; index: number; visible: boolean; isLatest?: boolean; number: number; onSelect: () => void }) {
  const cat = categoryStyles[entry.category] || categoryStyles.updates;
  const pub = formatPublished(entry.published_at);
  return (
    <div
      onClick={onSelect}
      className={`h-full min-h-[240px] border border-neutral-200/80 overflow-hidden transition-all duration-500 ease-out hover:border-neutral-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] cursor-pointer relative ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        background: "#ffffff",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      {/* Number badge */}
      <span className="absolute top-3 right-3 text-[10px] font-mono text-green-600 font-bold select-none">
        #{number}
      </span>
      <div className="p-3 sm:p-4 flex flex-col h-full">
        {/* Top row: badge + date */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`inline-block text-[9px] sm:text-[10px] font-mono uppercase rounded-full px-1.5 sm:px-2 py-0.5 border ${cat.color}`}>
            {cat.label}
          </span>
          <span className="text-[8px] sm:text-[9px] text-black/60 font-mono">{pub.date}</span>
        </div>
        {/* Day + Time */}
        <p className="text-[7px] sm:text-[8px] text-black/40 font-mono mb-2">{pub.day} &middot; {pub.time}</p>
        <h3 className="text-[11px] sm:text-xs font-bold text-neutral-900 leading-snug mb-2 break-words line-clamp-2 pr-6">
          {entry.title}
        </h3>
        <p className="text-[9px] sm:text-[10px] text-neutral-600 leading-relaxed mb-1.5 line-clamp-3">
          {truncate(entry.content, 22)}
        </p>
        <p className="text-[8px] sm:text-[9px] font-mono mb-3 text-black">
          - Enoch Chukwudi
        </p>
        {/* Subtle separator + Read more */}
        <div className="mt-auto border-t border-neutral-100">
          <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="w-full flex items-center justify-center gap-1 py-1.5 text-[9px] sm:text-[10px] font-medium text-neutral-400 hover:text-neutral-900 transition-all duration-200 group cursor-pointer">
            Read more
            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform duration-200 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JournalPage() {
  const [sectionRef, visible] = useInView(0.05);
  const [page, setPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryRow | null>(null);
  const [entries, setEntries] = useState<JournalEntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const perPage = usePerPage();

  useEffect(() => {
    fetchJournalEntries().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const totalPages = Math.ceil(entries.length / perPage);
  const paginatedEntries = entries.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const goToPage = (p: number) => {
    setPage(p);
  };

  const closeModal = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  return (
    <section id="journal-page" className="py-24 relative overflow-hidden min-h-screen">
      <div ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 lg:px-8 relative z-10">
        {/* Header */}
        <div className={`flex items-start gap-4 md:gap-6 mb-14 max-w-2xl mx-auto transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
          <div className="shrink-0 w-0.5 h-14 md:h-18 bg-white/20 mt-1" />
          <div>
            <p className="text-[10px] md:text-xs font-mono tracking-[0.35em] text-white/30 uppercase mb-2">
              [11]&nbsp;&nbsp;journal
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-none pb-3">
              JOURNAL
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl font-thin tracking-[0.2em] text-white/60 uppercase mt-1">
              I write
            </p>
          </div>
        </div>

        {/* Intro paragraph */}
        <div className={`max-w-2xl mx-auto mb-12 transition-all duration-700 ease-out delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="text-sm md:text-base text-white/70 leading-relaxed">
            Engineering notes, build logs, and architecture explorations capturing the thinking behind shipping
            end-to-end operational systems across web, mobile, dashboard, and desktop applications.
            It documents what was built, what was modified or removed, what is upcoming, and the engineering decisions behind each change.
            Each entry reflects the progression of systems, design trade-offs, and practical lessons from building and shipping real products.
          </p>
        </div>

        {/* Entries grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {loading ? (
            <div className="col-span-full text-center text-white/30 text-sm py-20">Loading journal entries...</div>
          ) : (
            paginatedEntries.map((entry, i) => {
              const globalIndex = (page - 1) * perPage + i;
              const number = entries.length - globalIndex;
              return (
                <JournalCard key={entry.id} entry={entry} index={i} visible={visible} isLatest={i === 0 && page === 1} number={number} onSelect={() => setSelectedEntry(entry)} />
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => { if (page > 1) goToPage(page - 1); }}
              disabled={page === 1}
              className="w-9 h-9 rounded-full text-xs font-medium flex items-center justify-center bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/90 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {(() => {
              const maxVisible = 3;
              let start = Math.max(1, page - 1);
              if (start + maxVisible - 1 > totalPages) start = Math.max(1, totalPages - maxVisible + 1);
              const visiblePages = Array.from({ length: Math.min(maxVisible, totalPages) }, (_, i) => start + i);
              return visiblePages.map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 ${
                    page === p
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/90"
                  }`}
                >
                  {p}
                </button>
              ));
            })()}
            <button
              onClick={() => { if (page < totalPages) goToPage(page + 1); }}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-full text-xs font-medium flex items-center justify-center bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/90 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Back link */}
        <div className={`mt-14 text-center transition-all duration-700 ease-out delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-medium rounded-full border border-white/20 bg-white/10 text-white/70 hover:bg-white hover:text-black hover:border-white transition-all duration-200 group"
          >
            Back to Home
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
      {/* Journal Modal */}
      <JournalModal entry={selectedEntry} onClose={closeModal} />
    </section>
  );
}