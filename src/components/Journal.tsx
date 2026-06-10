"use client";

import { useEffect, useRef, useState } from "react";
import { fetchJournalEntries } from "@/lib/data";
import type { JournalEntryRow } from "@/lib/data";
import { ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";
import JournalModal from "./JournalModal";
import { getTimeFormat } from "@/lib/settings";

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

function truncate(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

function JournalCard({ entry, index, visible, isLatest, onSelect }: { entry: JournalEntryRow; index: number; visible: boolean; isLatest?: boolean; onSelect: () => void }) {
  const cat = categoryStyles[entry.category] || categoryStyles.shipped;
  const pub = formatPublished(entry.published_at);
  return (
    <div
      onClick={onSelect}
      className={`shrink-0 w-[300px] md:w-[340px] border border-neutral-200/80  overflow-hidden transition-all duration-500 ease-out hover:border-neutral-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] cursor-pointer ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        background: "#ffffff",
        transitionDelay: `${index * 80}ms`,
      }}
    >
      <div className="p-6 md:p-7 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-2">
          <span className={`inline-block text-[10px] md:text-xs font-mono uppercase rounded-full px-2.5 py-1 border ${cat.color}`}>
            {cat.label}
          </span>
          <span className="text-[10px] md:text-xs text-black font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {pub.date}
          </span>
        </div>
        <p className="text-[11px] md:text-xs text-black font-mono mb-4 uppercase tracking-wider">
          Published {pub.day}, {pub.time}
        </p>
        <h3 className="text-sm md:text-base font-bold text-neutral-900 leading-snug mb-3 break-words">
          {entry.title}
        </h3>
        <p className="text-xs md:text-sm text-neutral-600 leading-relaxed mb-3">
          {truncate(entry.summary, 10)}
        </p>
        <p className="text-[10px] md:text-xs font-mono mb-5 pb-15 text-black">
          - Enoch Chukwudi
        </p>
        {/* Subtle separator + Read more */}
        <div className="mt-auto border-t border-neutral-100">
          <button onClick={(e) => { e.stopPropagation(); onSelect(); }} className="w-full flex items-center justify-center gap-1.5 py-3 text-[11px] md:text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-all duration-200 group cursor-pointer">
            Read more
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Journal() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryRow | null>(null);
  const [entries, setEntries] = useState<JournalEntryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJournalEntries().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const closeModal = () => {
    setSelectedEntry(null);
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const last10 = entries.slice(0, 10);

  return (
    <section id="journal" className="py-24 relative overflow-hidden">
      <div ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title — same header style as Projects */}
        <div className={`flex items-start gap-4 md:gap-6 mb-10 md:mb-14 max-w-2xl mx-auto transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
          <div className="shrink-0 w-0.5 h-14 md:h-18 bg-white/20 mt-1" />
          <div>
            <p className="text-[10px] md:text-xs font-mono tracking-[0.35em] text-white/30 uppercase mb-2">
              [11]&nbsp;&nbsp;journal
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-none">
              JOURNAL
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl font-thin tracking-[0.2em] text-white/60 uppercase mt-1">
              I write
            </p>
          </div>
        </div>

        {/* Intro paragraph */}
        <div className={`max-w-2xl mx-auto mb-10 transition-all duration-700 ease-out delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="text-sm md:text-base text-white/70 leading-relaxed">
            Engineering notes, build logs, and architecture explorations capturing the thinking behind shipping
            end-to-end operational systems across web, mobile, dashboard, and desktop applications.
            It documents what was built, what was modified or removed, what is upcoming, and the engineering decisions behind each change.
            Each entry reflects the progression of systems, design trade-offs, and practical lessons from building and shipping real products.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-white/30 text-sm py-20">Loading journal entries...</div>
        ) : (
          <>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 transition-all duration-700 ease-out delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              {last10.map((entry, i) => (
                <JournalCard key={entry.id} entry={entry} index={i} visible={visible} isLatest={i === 0} onSelect={() => setSelectedEntry(entry)} />
              ))}
            </div>

            {/* See more link */}
            <div className={`mt-8 text-center transition-all duration-700 ease-out delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <Link
                href="/journal"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-medium rounded-full border border-white/20 bg-white/10 text-white/70 hover:bg-white hover:text-black hover:border-white transition-all duration-200 group"
              >
                See more
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </>
        )}
      </div>
      {/* Journal Modal */}
      <JournalModal entry={selectedEntry} onClose={closeModal} />
    </section>
  );
}