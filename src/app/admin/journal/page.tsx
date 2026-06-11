"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, X, Search, AlertTriangle } from "lucide-react";
import { useTheme } from "../layout";

interface JournalEntry {
  id: number;
  date: string;
  published_at: string;
  title: string;
  category: "shipped" | "engineered" | "exploring" | "thinking";
  summary: string;
  content: string;
}

const defaultForm: Omit<JournalEntry, "id"> = {
  date: new Date().toISOString().split("T")[0],
  published_at: new Date().toISOString(),
  title: "", category: "shipped", summary: "", content: "",
};

const categoryColors: Record<string, string> = {
  shipped: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  engineered: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  exploring: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  thinking: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
};

const categoryIcons: Record<string, string> = {
  shipped: "\u2197",
  engineered: "\u2699",
  exploring: "\u25C7",
  thinking: "\u25CB",
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

function Textarea({ label, placeholder, value, onChange, required, hint, rows = 3 }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
  required?: boolean; hint?: string; rows?: number;
}) {
  const { theme } = useTheme();
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className={`w-full px-3 py-2 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none ${
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

function DeleteModal({ open, title, onConfirm, onCancel }: {
  open: boolean; title: string; onConfirm: () => void; onCancel: () => void;
}) {
  const { theme } = useTheme();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className={`w-full max-w-sm rounded-2xl p-6 ${
        theme === "dark" ? "bg-gray-900" : "bg-white border border-gray-200"
      }`}>
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
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >Cancel</button>
          <button onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
          >Delete</button>
        </div>
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
    if (editingId) {
      await supabase.from("journal_entries").update(form).eq("id", editingId);
    } else {
      await supabase.from("journal_entries").insert(form);
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
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries by title or summary..."
            className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all ${
              theme === "dark" ? "bg-white/5 text-white" : "bg-white text-gray-900 border border-gray-200"
            }`}
          />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className={`px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all ${
            theme === "dark" ? "bg-white/5 text-white" : "bg-white text-gray-900 border border-gray-200"
          }`}
        >
          <option value="all">All Categories</option>
          <option value="shipped">Shipped</option>
          <option value="engineered">Engineered</option>
          <option value="exploring">Exploring</option>
          <option value="thinking">Thinking</option>
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
        <div className="space-y-1">
          {filtered.map((entry) => (
            <div key={entry.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                theme === "dark" ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"
              }`}
            >
              {/* Category icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                theme === "dark" ? "bg-white/5" : "bg-gray-100"
              }`}>
                {categoryIcons[entry.category]}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                    {entry.title}
                  </span>
                </div>
                <p className={`text-[11px] mt-0.5 truncate ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              {/* Category badge */}
              <span className={`hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${categoryColors[entry.category]}`}>
                {entry.category}
              </span>
              {/* Actions */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button onClick={() => openEdit(entry)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    theme === "dark" ? "text-gray-500 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteTarget(entry)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
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
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  theme === "dark" ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                }`}
              ><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <Input label="Title" placeholder="e.g. National Logistics Visibility Platform - Phase 2 Deployed" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required hint="A clear, descriptive title for the journal entry" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Category <span className="text-red-500">*</span></label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className={`w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all ${
                      theme === "dark" ? "bg-white/5 text-white" : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    <option value="shipped">Shipped</option>
                    <option value="engineered">Engineered</option>
                    <option value="exploring">Exploring</option>
                    <option value="thinking">Thinking</option>
                  </select>
                </div>
                <Input label="Date" type="date" placeholder="" value={form.date} onChange={(v) => setForm({ ...form, date: v })} required hint="The date this entry relates to" />
                <Input label="Published At" type="datetime-local" placeholder="" value={form.published_at.slice(0, 16)} onChange={(v) => setForm({ ...form, published_at: new Date(v).toISOString() })} required hint="When this entry was published" />
              </div>

              <Textarea label="Summary" placeholder="A brief summary of the entry (shown in cards, e.g. Deployed real-time interstate shipment tracking with driver mobile app...)" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} required hint="This appears on the journal card - keep it concise" rows={2} />

              <Textarea label="Content" placeholder="Write the full journal article here. Include technical details, architecture decisions, challenges, and lessons learned..." value={form.content} onChange={(v) => setForm({ ...form, content: v })} required hint="Full markdown/article body - be as detailed as you want" rows={10} />

              <div className="flex items-center justify-end gap-3 pt-2 border-t dark:border-white/5">
                <button type="button" onClick={() => setShowForm(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    theme === "dark" ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
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