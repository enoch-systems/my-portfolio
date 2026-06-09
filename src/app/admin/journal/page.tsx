"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, X, Search, BookOpen } from "lucide-react";
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
  title: "",
  category: "shipped",
  summary: "",
  content: "",
};

const categoryColors: Record<string, string> = {
  shipped: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  engineered: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  exploring: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  thinking: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
};

function Input({ label, placeholder, value, onChange, required, hint, type = "text" }: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
  type?: string;
}) {
  const { theme } = useTheme();
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
            : "border-gray-200 bg-white text-gray-900"
        }`}
        required={required}
      />
      {hint && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{hint}</p>}
    </div>
  );
}

function Textarea({ label, placeholder, value, onChange, required, hint, rows = 3 }: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
  rows?: number;
}) {
  const { theme } = useTheme();
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 rounded-lg border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all resize-none ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
            : "border-gray-200 bg-white text-gray-900"
        }`}
        required={required}
      />
      {hint && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{hint}</p>}
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
  const { theme } = useTheme();

  const fetchEntries = async () => {
    const { data } = await supabase.from("journal_entries").select("*").order("published_at", { ascending: false });
    if (data) setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (e: JournalEntry) => {
    setForm({
      date: e.date,
      published_at: e.published_at,
      title: e.title,
      category: e.category,
      summary: e.summary,
      content: e.content,
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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) return;
    await supabase.from("journal_entries").delete().eq("id", id);
    fetchEntries();
  };

  const filtered = entries.filter((entry) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      entry.title.toLowerCase().includes(q) ||
      entry.summary.toLowerCase().includes(q);
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
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 active:scale-[0.97] transition-all duration-200 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries by title or summary..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${
              theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
            }`}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
            theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          <option value="all">All Categories</option>
          <option value="shipped">Shipped</option>
          <option value="engineered">Engineered</option>
          <option value="exploring">Exploring</option>
          <option value="thinking">Thinking</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className={`text-center py-16 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No entries found</p>
          <p className="text-xs mt-1">{searchQuery || filterCategory !== "all" ? "Try adjusting your filters" : "Create your first journal entry to get started"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"} border-b`}>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Title</th>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 hidden sm:table-cell">Category</th>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 hidden md:table-cell">Date</th>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr
                  key={entry.id}
                  className={`border-b ${theme === "dark" ? "border-gray-800 hover:bg-gray-900" : "border-gray-100 hover:bg-gray-50"} transition-colors`}
                >
                  <td className="py-3 px-4">
                    <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{entry.title}</span>
                    <p className={`text-[10px] mt-0.5 ${theme === "dark" ? "text-gray-600" : "text-gray-400"} max-w-[300px] truncate`}>{entry.summary}</p>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryColors[entry.category]}`}>
                      {entry.category}
                    </span>
                  </td>
                  <td className={`py-3 px-4 hidden md:table-cell ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                    {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(entry)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        theme === "dark" ? "hover:bg-gray-800 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                      }`} title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div
            className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${
              theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
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
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg transition-colors cursor-pointer ${
                theme === "dark" ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
              }`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Title */}
              <Input label="Title" placeholder="e.g. National Logistics Visibility Platform - Phase 2 Deployed" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required hint="A clear, descriptive title for the journal entry" />

              {/* Category + Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Category <span className="text-red-500">*</span></label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${
                      theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
                    }`}
                  >
                    <option value="shipped">🚀 Shipped</option>
                    <option value="engineered">⚙️ Engineered</option>
                    <option value="exploring">🔍 Exploring</option>
                    <option value="thinking">💭 Thinking</option>
                  </select>
                </div>
                <Input label="Date" type="date" placeholder="" value={form.date} onChange={(v) => setForm({ ...form, date: v })} required hint="The date this entry relates to" />
                <Input label="Published At" type="datetime-local" placeholder="" value={form.published_at.slice(0, 16)} onChange={(v) => setForm({ ...form, published_at: new Date(v).toISOString() })} required hint="When this entry was published" />
              </div>

              {/* Summary */}
              <Textarea label="Summary" placeholder="A brief summary of the entry (shown in cards, e.g. Deployed real-time interstate shipment tracking with driver mobile app...)" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} required hint="This appears on the journal card - keep it concise" rows={2} />

              {/* Content */}
              <Textarea label="Content" placeholder="Write the full journal article here. Include technical details, architecture decisions, challenges, and lessons learned..." value={form.content} onChange={(v) => setForm({ ...form, content: v })} required hint="Full markdown/article body - be as detailed as you want" rows={10} />

              <div className="flex items-center justify-end gap-3 pt-2 border-t dark:border-gray-800">
                <button type="button" onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  theme === "dark" ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 active:scale-[0.97] transition-all duration-200 shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
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
    </div>
  );
}