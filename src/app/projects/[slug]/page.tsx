"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  fetchProjectBySlug,
  fetchProjectsByType,
  type Project,
} from "@/lib/data/index";
import { optimizeCloudinaryUrl, getCloudinaryBlurUrl } from "@/lib/cloudinary/client";
import { ArrowLeft, ExternalLink, ArrowUpRight, Monitor, Clock, Moon, Sun } from "lucide-react";

function goBackToProjects(router: ReturnType<typeof useRouter>, tab: string) {
  router.push("/#projects");
}

async function determineProjectTab(slug: string): Promise<string> {
  const eng = await fetchProjectsByType("engineering");
  if (eng.some((p) => p.slug === slug)) return "engineering";
  const cli = await fetchProjectsByType("client");
  if (cli.some((p) => p.slug === slug)) return "client";
  return "research";
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [projectTab, setProjectTab] = useState("engineering");
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("projectDarkMode");
    if (stored !== null) {
      setDark(stored === "true");
    } else {
      setDark(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("projectDarkMode", String(dark));
  }, [dark]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      fetchProjectBySlug(slug),
      determineProjectTab(slug),
    ]).then(([proj, tab]) => {
      setProject(proj ?? null);
      setProjectTab(tab);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <main className={`relative min-h-screen ${dark ? "bg-black" : "bg-white"} flex items-center justify-center`}>
        <div className={dark ? "text-white/60 text-sm" : "text-slate-800 text-sm font-medium"}>Loading project...</div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className={`relative min-h-screen ${dark ? "bg-black" : "bg-white"} flex items-center justify-center`}>
        <div className="fixed inset-0" style={{ backgroundColor: dark ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.97)" }} />
        <div
          className="fixed inset-0"
          style={{
            backgroundImage: "url('https://res.cloudinary.com/djdbcoyot/image/upload/v1779492891/tvchvy2zbigbduggdlmi.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            filter: "blur(4px)",
            opacity: dark ? 0.35 : 0.5,
            transform: "scale(1.05)",
          }}
        />
        <div className={`fixed inset-0 bg-gradient-to-b ${dark ? "from-black/80 via-black/60 to-black/90" : "from-white/80 via-white/60 to-white/90"}`} />
        <div className="relative z-10 text-center px-6">
          <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${dark ? "bg-white/[0.08]" : "bg-black/[0.06]"} flex items-center justify-center`}>
            <Monitor className={`w-7 h-7 ${dark ? "text-white/40" : "text-slate-600"}`} />
          </div>
          <h1 className={`text-4xl font-normal tracking-tight ${dark ? "text-white" : "text-slate-900"} mb-3`}>
            Project Not Found
          </h1>
          <p className={`${dark ? "text-white/60" : "text-slate-700"} mb-8 text-base leading-relaxed max-w-md mx-auto`}>
            The project you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/#projects")}
            className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-full border transition-all duration-300 cursor-pointer ${
              dark
                ? "border-white/20 bg-white/10 text-white/70 hover:bg-white hover:text-black hover:border-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={`relative min-h-screen ${dark ? "bg-black" : "bg-white"}`}>
      {/* Fixed background - solid white in light mode, image + overlay in dark mode */}
      {dark ? (
        <>
          <div className="fixed inset-0" style={{ backgroundColor: "rgba(0,0,0,0.92)" }} />
          <div className="fixed inset-0 overflow-hidden" style={{ filter: "blur(4px)", opacity: 0.25, transform: "scale(1.05)" }}>
            <Image
              src={optimizeCloudinaryUrl("https://res.cloudinary.com/djdbcoyot/image/upload/v1779492891/tvchvy2zbigbduggdlmi.jpg", 1920)}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
              placeholder="blur"
              blurDataURL={getCloudinaryBlurUrl("https://res.cloudinary.com/djdbcoyot/image/upload/v1779492891/tvchvy2zbigbduggdlmi.jpg")}
            />
          </div>
          <div className="fixed inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/95" />
        </>
      ) : (
        <div className="fixed inset-0 bg-white" />
      )}

      {/* Top bar */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => goBackToProjects(router, projectTab)}
            className={`group inline-flex items-center gap-1.5 text-sm ${dark ? "text-white/50 hover:text-white" : "text-slate-600 hover:text-slate-900"} transition-all duration-200 cursor-pointer`}
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to Projects
          </button>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-5 lg:px-6 pb-32">

        {/* Divider */}
        <div className="mb-16 border-t" style={{ borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)" }} />

        {/* Dark mode toggle + Project header */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Dark mode toggle - right aligned */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setDark(!dark)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-300 cursor-pointer shadow-sm ${
                dark
                  ? "border-white/15 bg-white/[0.07] text-white/70 hover:bg-white/[0.12]"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {dark ? (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span>Read on light mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span>Read on dark mode</span>
                </>
              )}
            </button>
          </div>

          {/* Project header */}
          <div className="space-y-4">
            <p className={`text-[11px] font-mono tracking-wider ${dark ? "text-white/40" : "text-slate-600"} uppercase`}>
              About the project
            </p>
            <h1 className={`text-3xl md:text-4xl font-medium ${dark ? "text-white" : "text-slate-900"}`}>
              {project.name}
            </h1>
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${dark ? "text-white/60" : "text-slate-700"}`}>
              {project.about || project.problem}
            </p>
          </div>
        </div>

        {/* Glass card with image, last updated, and view project */}
        <div
          className="max-w-4xl mx-auto mb-24 rounded-2xl border overflow-hidden shadow-sm"
          style={{
            borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)",
            backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)",
            backdropFilter: dark ? "blur(24px)" : "none",
          }}
        >
          <div className="p-4 md:p-6 space-y-8">
            {/* Image + About section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
              <div className="lg:col-span-3 lg:order-2">
                {project.image ? (
                  <div className="relative w-full aspect-[8/5] rounded-xl overflow-hidden">
                    <Image
                      src={optimizeCloudinaryUrl(project.image, 800)}
                      alt={project.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="w-full h-full object-cover"
                      placeholder="blur"
                      blurDataURL={getCloudinaryBlurUrl(project.image)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/[0.18] to-transparent pointer-events-none" />
                  </div>
                ) : (
                  <div
                    className="relative w-full aspect-[8/5] rounded-xl overflow-hidden flex items-center justify-center"
                    style={{
                      backgroundColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                      borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)",
                      borderWidth: 1,
                      borderStyle: "solid",
                    }}
                  >
                    <svg className={`w-12 h-12 ${dark ? "text-white/20" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="lg:col-span-2 lg:order-1 p-4 md:p-5">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className={`text-xs ${dark ? "text-white" : "text-slate-600"} flex items-center gap-2`}>
                      <div className={`w-1 h-1 rounded-full ${dark ? "bg-emerald-400" : "bg-emerald-600"}`} />
                      Last updated {(() => {
                        const date = project.updatedAt || project.createdAt;
                        if (!date) return "N/A";
                        const d = new Date(date);
                        const month = d.toLocaleString('en-US', { month: 'short' });
                        const day = d.getDate();
                        const year = d.getFullYear();
                        return `${month} ${day}, ${year}`;
                      })()}
                    </div>
                    <div className={`text-xs ${dark ? "text-white/40" : "text-slate-500"} flex items-center gap-1.5 pl-2.5`}>
                      <Clock className="w-3 h-3" />
                      {(() => {
                        const date = project.updatedAt || project.createdAt;
                        if (!date) return "";
                        const d = new Date(date);
                        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                      })()}
                    </div>
                  </div>
                  {/* View Project button */}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-300 ${
                        dark
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "border-emerald-500/30 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-sm"
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      View Project
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" style={{ borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)" }} />

            {/* Problem Solved + Approach + Details in one grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div>
                  <h2 className={`text-lg font-medium ${dark ? "text-white" : "text-slate-900"} mb-4`}>Problem</h2>
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${dark ? "text-white/60" : "text-slate-800"}`}>
                    {project.problem}
                  </p>
                </div>
                <div className="border-t pt-6" style={{ borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)" }}>
                  <h2 className={`text-lg font-medium ${dark ? "text-white" : "text-slate-900"} mb-4`}>Approach</h2>
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${dark ? "text-white/60" : "text-slate-800"}`}>
                    {project.approach}
                  </p>
                </div>
                {/* GitHub link below Approach */}
                {project.githubUrl && (
                  <div className="border-t pt-6" style={{ borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)" }}>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group inline-flex items-center gap-2 text-sm ${dark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"} transition-colors duration-200`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span>See more about this project on Github</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Details sidebar */}
              <div className="lg:col-span-2">
                <div
                  className="rounded-2xl border p-5 md:p-6"
                  style={{
                    backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
                    borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.15)",
                  }}
                >
                  <h3 className={`text-xs font-mono tracking-wider ${dark ? "text-white/40" : "text-slate-600"} uppercase mb-4`}>
                    Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className={`text-[11px] font-mono tracking-wider ${dark ? "text-white/40" : "text-slate-600"} uppercase mb-1`}>Category</p>
                      <p className={`text-sm font-medium ${dark ? "text-white/80" : "text-slate-800"}`}>{project.category}</p>
                    </div>
                    <div>
                      <p className={`text-[11px] font-mono tracking-wider ${dark ? "text-white/40" : "text-slate-600"} uppercase mb-1`}>Platforms</p>
                      <p className={`text-sm font-medium ${dark ? "text-white/80" : "text-slate-800"}`}>{project.platforms}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}