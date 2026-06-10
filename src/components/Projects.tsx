"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { fetchAllProjects, type Project } from "@/lib/data";
import { optimizeCloudinaryUrl, getCloudinaryBlurUrl } from "@/lib/cloudinary";
import ProjectModal from "./ProjectModal";

const PER_PAGE = 4;

export default function Projects() {
  const router = useRouter();
  const [tab, setTab] = useState<"engineering" | "client" | "research">("engineering");
  const [page, setPage] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch all 3 project types at once — cached by React Query
  const { data: allProjects, isLoading } = useQuery({
    queryKey: ["all-projects"],
    queryFn: fetchAllProjects,
    staleTime: 5 * 60 * 1000,
  });

  // Get current tab's projects from cache (instant, no network)
  const projects = allProjects ? allProjects[tab] : [];
  const totalPages = Math.ceil(projects.length / PER_PAGE);
  const paginatedProjects = projects.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [tab]);

  // Intersection observer for entrance animations
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const switchTab = (t: "engineering" | "client" | "research") => {
    setTab(t);
  };

  const goToPage = (p: number) => {
    setPage(p);
  };

  return (
    <section id="projects" className="py-24 relative overflow-hidden">
      <div ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <div className={`flex items-start gap-4 md:gap-6 mb-10 md:mb-14 max-w-2xl mx-auto transition-all duration-1000 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
          <div className="shrink-0 w-0.5 h-14 md:h-18 bg-white/20 mt-1" />
          <div>
            <p className="text-[10px] md:text-xs font-mono tracking-[0.35em] text-white/30 uppercase mb-2">
              [10]&nbsp;&nbsp;projects
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-none">
              PROJECTS
            </h2>
            <p className="text-xl sm:text-2xl md:text-3xl font-thin tracking-[0.2em] text-white/60 uppercase mt-1">
              I ship
            </p>
          </div>
        </div>

        {/* Tab toggle */}
        <div className={`flex flex-wrap justify-center gap-2 mb-10 transition-all duration-1000 ease-out delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <button
            onClick={() => switchTab("engineering")}
            className={`px-6 py-3 rounded-full text-[11px] md:text-sm font-medium uppercase transition-all duration-200 cursor-pointer ${
              tab === "engineering"
                ? "bg-white text-black"
                : "border border-white/20 bg-white/10 text-white/70 hover:bg-white hover:text-black hover:border-white"
            }`}
          >
            Engineering Systems
          </button>
          <button
            onClick={() => switchTab("client")}
            className={`px-6 py-3 rounded-full text-[11px] md:text-sm font-medium uppercase transition-all duration-200 cursor-pointer ${
              tab === "client"
                ? "bg-white text-black"
                : "border border-white/20 bg-white/10 text-white/70 hover:bg-white hover:text-black hover:border-white"
            }`}
          >
            Client Systems
          </button>
          <button
            onClick={() => switchTab("research")}
            className={`px-6 py-3 rounded-full text-[11px] md:text-sm font-medium uppercase transition-all duration-200 cursor-pointer ${
              tab === "research"
                ? "bg-white text-black"
                : "border border-white/20 bg-white/10 text-white/70 hover:bg-white hover:text-black hover:border-white"
            }`}
          >
            Research & Architecture
          </button>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="text-center text-white/30 text-sm py-20">Loading projects...</div>
        ) : (
          <>
            {/* Project grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
              {paginatedProjects.map((project, i) => (
                <div
                  key={project.name}
                  className={`relative border border-white/[0.10] bg-white/[0.04] backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:border-[#25D366]/30 hover:shadow-[0_8px_32px_rgba(37,211,102,0.08)] ${
                    visible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{
                    transitionDelay: `${i * 60}ms`,
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                    <div className="md:col-span-3 md:order-2 p-2 md:p-3">
                      {project.image ? (
                        <div className="relative w-full aspect-[8/5] rounded-xl overflow-hidden">
                          <Image
                            src={optimizeCloudinaryUrl(project.image, 600)}
                            alt={project.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 60vw"
                            className="w-full h-full object-cover"
                            placeholder="blur"
                            blurDataURL={getCloudinaryBlurUrl(project.image)}
                          />
                          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/[0.18] to-transparent pointer-events-none" />
                        </div>
                      ) : (
                        <div className="relative w-full aspect-[8/5] rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.10] flex items-center justify-center">
                          <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2 md:order-1 p-4 md:p-5">
                      <div className="space-y-3">
                        <span className="inline-block text-[10px] font-mono uppercase rounded-full px-2.5 py-1 border border-emerald-500/30 bg-emerald-500/15 text-emerald-300">
                          {project.category}
                        </span>
                        <p className="text-[10px] font-mono tracking-wider text-white/40 uppercase">
                          About the project
                        </p>
                        <h3 className="text-sm md:text-base font-medium text-white leading-snug">
                          {project.name}
                        </h3>
                        <p className="text-xs md:text-sm text-white/60 leading-relaxed line-clamp-4">
                          {project.about}
                        </p>
                        <p className="text-[10px] md:text-xs text-white/40 font-mono">
                          {project.platforms}
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => router.push(`/projects/${project.slug}`)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[11px] md:text-xs font-medium rounded-full border border-white/20 bg-white/10 text-white/70 hover:bg-white hover:text-black hover:border-white transition-all duration-200 group cursor-pointer"
                          >
                            View Project
                            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
          </>
        )}

        {/* Project Detail Modal */}
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      </div>
    </section>
  );
}