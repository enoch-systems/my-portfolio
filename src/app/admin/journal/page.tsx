"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Plus, Pencil, Trash2, X, Search, AlertTriangle, Expand } from "lucide-react";
import { useTheme } from "../layout";

interface JournalEntry {
  id: number;
  date: string;
  published_at: string;
  title: string;
  category: "updates" | "progress" | "shipped" | "modification" | "research" | "architecture";
  summary: string;
  content: string;
}

const defaultForm: Omit<JournalEntry, "id"> = {
  date: new Date().toISOString().split("T")[0],
  published_at: new Date().toISOString(),
  title: "", category: "updates", summary: "", content: "",
};

const categoryColors: Record<string, string> = {
  updates: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  progress: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  shipped: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  modification: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  research: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  architecture: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

function Input({ label, placeholder, value, onChange, required, hint, type = "text" }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
  required?: boolean; hint?: string; type?: string;
}) {
  const { theme } = useTheme();
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all ${
          theme === "dark"
            ? "bg-white/5 text-white placeholder-gray-500"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
        required={required}
      />
      {hint && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{hint}</p>}
    </div>
  );
}

function FullscreenEditor({ open, value, onChange, onClose, label }: {
  open: boolean; value: string; onChange: (v: string) => void; onClose: () => void; label: string;
}) {
  const [editValue, setEditValue] = useState(value);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => { onChange(editValue); onClose(); }}
            className="px-5 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >Save & Close</button>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          ><X className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="flex-1 flex items-start justify-center px-3 sm:px-4 md:px-8 py-4 md:py-8 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full max-w-3xl h-full min-h-[60vh] p-3 sm:p-4 md:p-8 rounded-2xl bg-white dark:bg-white text-gray-900 text-base leading-relaxed focus:outline-none resize-none shadow-sm border border-gray-100"
          style={{ whiteSpace: "pre-wrap", lineHeight: "1.8" }}
          placeholder="Start typing..."
        />
      </div>
    </div>
  );
}

export default function AdminJournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);
  const [fullscreenField, setFullscreenField] = useState<string | null>(null);
  const { theme } = useTheme();

  const fetchEntries = async () => {
    const { data } = await supabase.from("journal_entries").select("*").order("published_at", { ascending: false });
    if (data) setEntries(data);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const openCreate = () => { setForm(defaultForm); setEditingId(null); setShowForm(true); };

  const openEdit = (e: JournalEntry) => {
    setForm({
      date: e.date, published_at: e.published_at, title: e.title,
      category: e.category, summary: e.summary, content: e.content,
    });
    setEditingId(e.id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    if (editingId) {
      // Update: keep original published_at, only update other fields. DB trigger auto-sets updated_at.
      const { published_at, ...rest } = form;
      await supabase.from("journal_entries").update({ ...rest, date: today }).eq("id", editingId);
    } else {
      // Create: auto-set date and published_at to current time
      await supabase.from("journal_entries").insert({ ...form, date: today, published_at: now.toISOString() });
    }
    setSaving(false);
    setShowForm(false);
    fetchEntries();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    await supabase.from("journal_entries").delete().eq("id", target.id);
    fetchEntries();
  };

  const openFullscreen = (field: string) => setFullscreenField(field);
  const closeFullscreen = () => setFullscreenField(null);

  const filtered = entries.filter((entry) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = entry.title.toLowerCase().includes(q) || entry.summary.toLowerCase().includes(q);
    const matchesCategory = filterCategory === "all" || entry.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-transparent animate-spin" />
          Loading journal entries...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Journal Entries</h1>
          <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} mt-0.5`}>
            {entries.length} entr{entries.length !== 1 ? "ies" : "y"} total
          </p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.97] transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all ${
              theme === "dark" ? "bg-white/5 text-white" : "bg-white text-gray-900 border border-gray-200"
            }`}
          />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className={`px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all ${
            theme === "dark"
              ? "bg-gray-800 text-white border border-gray-700 [&>option]:bg-gray-800 [&>option]:text-white"
              : "bg-white text-gray-900 border border-gray-200"
          }`}
        >
          <option value="all">All Categories</option>
          <option value="updates">Updates</option>
          <option value="progress">Progress</option>
          <option value="shipped">Shipped</option>
          <option value="modification">Modification</option>
          <option value="research">Research</option>
          <option value="architecture">Architecture</option>
        </select>
      </div>

      {/* Entries list */}
      {filtered.length === 0 ? (
        <div className={`text-center py-16 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
          <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-sm font-medium">No entries found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((entry) => (
            <div key={entry.id}
              className={`px-4 py-3.5 rounded-xl ${
                theme === "dark" ? "bg-white/[0.04]" : "bg-white shadow-sm border border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-semibold truncate block ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {entry.title}
                  </span>
                  <p className={`text-xs mt-1 line-clamp-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                    {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryColors[entry.category] || categoryColors.updates}`}>
                      {entry.category === "updates" ? "Updates" : entry.category === "progress" ? "Progress" : entry.category === "shipped" ? "Shipped" : entry.category === "modification" ? "Modification" : entry.category === "research" ? "Research" : entry.category === "architecture" ? "Architecture" : entry.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button onClick={() => openEdit(entry)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === "dark" ? "text-gray-500 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"}`}
                  ><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteTarget(entry)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                  ><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && !fullscreenField && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className={`w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto ${
            theme === "dark" ? "bg-gray-900" : "bg-white border border-gray-200"
          }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {editingId ? "Edit Journal Entry" : "New Journal Entry"}
                </h3>
                <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} mt-0.5`}>
                  {editingId ? "Update the entry details below" : "Write a new journal entry for your portfolio"}
                </p>
              </div>
              <button onClick={() => setShowForm(false)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${theme === "dark" ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
              ><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <Input label="Title" placeholder="e.g. National Logistics Visibility Platform - Phase 2 Deployed" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required hint="A clear, descriptive title for the journal entry" />

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category <span className="text-red-500">*</span></label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all ${
                    theme === "dark"
                      ? "bg-gray-800 text-white border border-gray-700 [&>option]:bg-gray-800 [&>option]:text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <option value="updates">Updates</option>
                  <option value="progress">Progress</option>
                  <option value="shipped">Shipped</option>
                  <option value="modification">Modification</option>
                  <option value="research">Research</option>
                  <option value="architecture">Architecture</option>
                </select>
              </div>

              {/* Summary - expandable */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                    Summary <span className="text-red-500">*</span>
                  </label>
                  <button type="button" onClick={() => openFullscreen("summary")}
                    className="text-[10px] text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
                  ><Expand className="w-3 h-3" /> Expand</button>
                </div>
                <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="A brief summary of the entry (shown in cards)..."
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none ${
                    theme === "dark" ? "bg-white/5 text-white placeholder-gray-500" : "bg-white text-gray-900 border border-gray-200"
                  }`}
                  required
                />
              </div>

              {/* Content - expandable */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <button type="button" onClick={() => openFullscreen("content")}
                    className="text-[10px] text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
                  ><Expand className="w-3 h-3" /> Expand</button>
                </div>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write the full journal article here..."
                  rows={5}
                  className={`w-full px-3 py-2 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none ${
                    theme === "dark" ? "bg-white/5 text-white placeholder-gray-500" : "bg-white text-gray-900 border border-gray-200"
                  }`}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t dark:border-white/5">
                <button type="button" onClick={() => setShowForm(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                >Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.97] transition-all duration-150 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Saving...
                    </span>
                  ) : editingId ? "Update Entry" : "Create Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen editors */}
      <FullscreenEditor
        open={fullscreenField === "summary"}
        value={form.summary}
        onChange={(v) => setForm({ ...form, summary: v })}
        onClose={closeFullscreen}
        label="Summary"
      />
      <FullscreenEditor
        open={fullscreenField === "content"}
        value={form.content}
        onChange={(v) => setForm({ ...form, content: v })}
        onClose={closeFullscreen}
        label="Content"
      />

      {/* Delete confirmation modal */}
      <DeleteModal
        open={deleteTarget !== null}
        title={deleteTarget?.title ?? ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function DeleteModal({ open, title, onConfirm, onCancel }: {
  open: boolean; title: string; onConfirm: () => void; onCancel: () => void;
}) {
  const { theme } = useTheme();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className={`w-full max-w-sm rounded-2xl p-6 ${theme === "dark" ? "bg-gray-900" : "bg-white border border-gray-200"}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Delete entry</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Are you sure you want to delete &ldquo;{title}&rdquo;? This cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
          >Cancel</button>
          <button onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
          >Delete</button>
        </div>
      </div>
    </div>
  );
}