import { supabase } from "./supabase";

export const personalData = {
  name: "Enoch Chukwudi",
  tagline: "BACKEND FULLSTACK DEVELOPER // OPERATIONAL SYSTEMS",
  introduction:
    "I'm a backend-leaning fullstack developer focused on building real-world operational systems using modern web technologies.",
  location: "Nigeria (Remote)",
  timezone: "WAT (UTC+1)",
  email: "enochc.official@gmail.com",
  linkedin: "https://www.linkedin.com/in/enochchukwudi?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
  github: "https://github.com/enoch-systems",
  twitter: "https://x.com/_enochsystems?s=21",
  bio: [
    "I'm a backend-leaning fullstack developer focused on building real-world operational systems using modern web technologies.",
    "I enjoy designing APIs, business workflows, transaction systems, authentication flows, and scalable backend architectures while also building clean frontend experiences.",
    "My current focus includes fintech-style systems, logistics operations, fraud-aware workflows, and fullstack applications with structured architecture.",
  ],
};

export interface Project {
  name: string;
  slug: string;
  category: string;
  platforms: string;
  image?: string;
  liveUrl?: string;
  githubUrl?: string;
  about?: string;
  problem: string;
  approach: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectRow {
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
  created_at: string;
  updated_at: string;
}

export interface JournalEntryRow {
  id: number;
  date: string;
  published_at: string;
  title: string;
  category: "shipped" | "engineered" | "exploring" | "thinking";
  summary: string;
  content: string;
}

/** Map a DB row to the Project interface used by components */
function rowToProject(row: ProjectRow): Project {
  return {
    name: row.name,
    slug: row.slug,
    category: row.category,
    platforms: row.platforms,
    image: row.image ?? undefined,
    liveUrl: row.live_url ?? undefined,
    githubUrl: row.github_url ?? undefined,
    about: row.about ?? undefined,
    problem: row.problem,
    approach: row.approach,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Fetch projects by category_type from Supabase */
export async function fetchProjectsByType(type: "engineering" | "client" | "research"): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("category_type", type)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];
  return data.map(rowToProject);
}

/** Fetch all projects from Supabase */
export async function fetchAllProjects(): Promise<{ engineering: Project[]; client: Project[]; research: Project[] }> {
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  if (!data) return { engineering: [], client: [], research: [] };

  return {
    engineering: data.filter((r) => r.category_type === "engineering").map(rowToProject),
    client: data.filter((r) => r.category_type === "client").map(rowToProject),
    research: data.filter((r) => r.category_type === "research").map(rowToProject),
  };
}

/** Fetch journal entries from Supabase */
export async function fetchJournalEntries(): Promise<JournalEntryRow[]> {
  const { data, error } = await supabase.from("journal_entries").select("*").order("published_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

/** Fetch a single project by slug from Supabase */
export async function fetchProjectBySlug(slug: string): Promise<Project | undefined> {
  const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).single();
  if (error) throw error;
  return rowToProject(data);
}

