"use client";

import { useRouter } from "next/navigation";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/[0.08] transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center cursor-pointer"
        >
          <img
            src="https://res.cloudinary.com/djdbcoyot/image/upload/v1780133162/mnteqbivqp3h4rd5umcn.png"
            alt="Logo"
            className="h-6 w-auto"
          />
          <span className="text-base md:text-xl font-light tracking-wide -ml-0.5"><span className="text-white">noch</span><span className="text-green-300">systems</span></span>
        </button>

        {/* Right side: links + button */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10 xl:gap-12">
            <button
              onClick={() => router.push("/")}
              className="group relative text-lg font-normal tracking-[0.12em] text-white/80 transition-all duration-200 hover:text-white cursor-pointer"
            >
              Home
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </button>
            <a
              href="/#about"
              className="group relative text-[15px] font-normal tracking-[0.12em] text-white/80 transition-all duration-200 hover:text-white"
            >
              About
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="/#projects"
              className="group relative text-lg font-normal tracking-[0.12em] text-white/80 transition-all duration-200 hover:text-white"
            >
              Projects
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="/#journal"
              className="group relative text-[15px] font-normal tracking-[0.12em] text-white/80 transition-all duration-200 hover:text-white"
            >
              Journal
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="/#contact"
              className="group relative text-[15px] font-normal tracking-[0.12em] text-white/80 transition-all duration-200 hover:text-white"
            >
              Contact Me
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
            </a>
          </div>

          {/* Hamburger — mobile */}
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}