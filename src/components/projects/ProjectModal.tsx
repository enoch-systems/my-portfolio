"use client";

import { useEffect } from "react";
import { X, Lock, Eye, Shield, FileText } from "lucide-react";
import type { Project } from "@/lib/data/index";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [project]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/[0.12] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] animate-fade-in-center">
        {/* Glass background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.12] to-white/[0.05] backdrop-blur-xl rounded-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/5 to-transparent rounded-2xl" />

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all duration-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Restricted badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-200 text-[10px] font-mono uppercase tracking-wider">
              <Lock className="w-3 h-3" />
              Restricted
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-200 text-[10px] font-mono uppercase tracking-wider">
              <Shield className="w-3 h-3" />
              Confidential
            </div>
          </div>

          {/* Project header */}
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
            {project.name}
          </h3>
          <span className="inline-block text-[11px] font-mono uppercase rounded-full px-2.5 py-0.5 border border-yellow-500/30 bg-yellow-500/15 text-yellow-200 mb-4">
            {project.category}
          </span>

          {/* Divider */}
          <div className="h-px bg-white/[0.08] my-4" />

          {/* Details */}
          <div className="space-y-3 mb-5">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/30 mb-1">Platforms</p>
              <p className="text-sm text-white/80">{project.platforms}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/30 mb-1">Description</p>
              <p className="text-sm text-white/70 leading-relaxed">{project.about}</p>
            </div>
          </div>

          {/* Restricted notice */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 mb-5">
            <div className="flex items-start gap-3">
              <Eye className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white/70 mb-1">Public Access Restricted</p>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  This project contains proprietary information and is not available for public viewing.
                  For inquiries or demo requests, please reach out via the Contact section.
                </p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-medium rounded-full border border-white/20 bg-white/10 text-white/70 hover:bg-white hover:text-black hover:border-white transition-all duration-200 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}