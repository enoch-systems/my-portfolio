"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, X, ExternalLink, Search, FolderKanban } from "lucide-react";
import { useTheme } from "../layout";

interface Project {
  id: string;
  name: string;
  slug: string;
  category: string;
  platforms: string;
  category_type: "engineering" | "client" | "research";
  image: string | null;
  live_url: string | null;
  github_url: string | null;
  about: string | null;
  problem: string;
  approach: string;
}

const defaultForm: Omit<Project, "id"> = {
  name: "",
  slug: "",
  category: "",
  platforms: "",
  category_type: "engineering",
  image: null,
  live_url: null,
  github_url: null,
  about: null,
  problem: "",
  approach: "",
};

const typeColors: Record<string, string> = {
  engineering: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  client: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  research: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
};

function Input({ label, placeholder, value, onChange, required, hint }: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
}) {
  const { theme } = useTheme();
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
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
  value: string | null;
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
        value={value ?? ""}
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

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const { theme } = useTheme();

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (data) setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreate = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: Project) => {
    setForm({
      name: p.name,
      slug: p.slug,
      category: p.category,
      platforms: p.platforms,
      category_type: p.category_type,
      image: p.image,
      live_url: p.live_url,
      github_url: p.github_url,
      about: p.about,
      problem: p.problem,
      approach: p.approach,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image || !form.image.trim()) {
      alert("Image URL is required. Please provide an image URL for this project.");
      return;
    }
    setSaving(true);
    const payload = { ...form, slug: form.slug || generateSlug(form.name) };
    if (editingId) {
      await supabase.from("projects").update(payload).eq("id", editingId);
    } else {
      await supabase.from("projects").insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      alert(`Failed to delete project: ${error.message}`);
      return;
    }
    fetchProjects();
  };

  const filtered = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.platforms.toLowerCase().includes(q);
    const matchesType = filterType === "all" || p.category_type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-transparent animate-spin" />
          Loading projects...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Projects</h1>
          <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} mt-0.5`}>
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 active:scale-[0.97] transition-all duration-200 shadow-lg shadow-blue-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, category, or platform..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${
              theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
            }`}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
            theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          <option value="all">All Types</option>
          <option value="engineering">Engineering</option>
          <option value="client">Client</option>
          <option value="research">Research</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className={`text-center py-16 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
          <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No projects found</p>
          <p className="text-xs mt-1">{searchQuery || filterType !== "all" ? "Try adjusting your filters" : "Create your first project to get started"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"} border-b`}>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Name</th>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 hidden md:table-cell">Category</th>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 hidden sm:table-cell">Platforms</th>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Type</th>
                <th className="py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className={`border-b ${theme === "dark" ? "border-gray-800 hover:bg-gray-900" : "border-gray-100 hover:bg-gray-50"} transition-colors`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{p.name}</span>
                      {p.live_url && (
                        <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 flex-shrink-0">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className={`text-[10px] mt-0.5 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}>{p.slug}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 hidden md:table-cell">{p.category}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 hidden sm:table-cell max-w-[200px] truncate">{p.platforms}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${typeColors[p.category_type]}`}>
                      {p.category_type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        theme === "dark" ? "hover:bg-gray-800 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                      }`} title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer" title="Delete">
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
                  {editingId ? "Edit Project" : "New Project"}
                </h3>
                <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"} mt-0.5`}>
                  {editingId ? "Update the project details below" : "Fill in the details to create a new project"}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className={`p-2 rounded-lg transition-colors cursor-pointer ${
                theme === "dark" ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
              }`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Project Name" placeholder="e.g. Multi-Tenant SaaS ERP" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <Input label="Slug" placeholder="Auto-generated from name" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} hint="Leave empty to auto-generate" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Category Type <span className="text-red-500">*</span></label>
                  <select
                    value={form.category_type}
                    onChange={(e) => setForm({ ...form, category_type: e.target.value as any })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${
                      theme === "dark" ? "border-gray-700 bg-gray-800 text-white" : "border-gray-200 bg-white text-gray-900"
                    }`}
                  >
                    <option value="engineering">Engineering Systems</option>
                    <option value="client">Client Systems</option>
                    <option value="research">Research & Architecture</option>
                  </select>
                </div>
                <Input label="Category" placeholder="e.g. Enterprise SaaS" value={form.category} onChange={(v) => setForm({ ...form, category: v })} required />
              </div>

              <Input label="Platforms" placeholder="e.g. Web App, Web Dashboard + Mobile App + API" value={form.platforms} onChange={(v) => setForm({ ...form, platforms: v })} required />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Image URL" placeholder="https://images.unsplash.com/..." value={form.image || ""} onChange={(v) => setForm({ ...form, image: v || null })} required hint="Must be 1200×750 pixels (8:5 ratio) — this is compulsory" />
                <Input label="Live URL" placeholder="https://example.com" value={form.live_url || ""} onChange={(v) => setForm({ ...form, live_url: v || null })} hint="Link to the live/deployed project" />
              </div>

              <Input label="GitHub URL" placeholder="https://github.com/enoch-systems/..." value={form.github_url || ""} onChange={(v) => setForm({ ...form, github_url: v || null })} hint="Link to the source code repository" />

              <Textarea label="About" placeholder="A longer description shown on the project detail page..." value={form.about} onChange={(v) => setForm({ ...form, about: v || null })} hint="Optional - shown in the header of the project detail page" rows={3} />

              <Textarea label="Problem" placeholder="What problem does this project solve?" value={form.problem} onChange={(v) => setForm({ ...form, problem: v })} hint="Shown in the Problem section on the project detail page" rows={3} />

              <Textarea label="Approach" placeholder="How was the problem solved?" value={form.approach} onChange={(v) => setForm({ ...form, approach: v })} hint="Shown in the Approach section on the project detail page" rows={3} />

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
                  ) : editingId ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}