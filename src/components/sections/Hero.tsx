"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Hero({ children }: { children: React.ReactNode }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-12 mb-10">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-2 -mb-10 pt-10 md:pt-32 lg:px-8">
        <div className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center">
          <div className="relative z-20 flex flex-col items-center justify-center gap-8">
            <div className="relative mx-auto">
              <div className="relative w-[90vw] h-[90vw] sm:w-[440px] sm:h-[440px] md:w-[520px] md:h-[520px] max-w-[520px] max-h-[520px]">
                {/* Circular badge with text */}
                <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 540 540" aria-hidden="true">
                  <defs>
                    <path id="circlePath" d="M 270, 270 m -250, 0 a 250,250 0 1,1 500,0 a 250,250 0 1,1 -500,0" />
                  </defs>
                  <circle cx="270" cy="270" r="250" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
              <text className="text-[1.2rem] sm:text-[1.4rem] font-light fill-white/80" fontSize="1.6" fontWeight="300">
                    <textPath href="#circlePath" startOffset="0%">
                      Interface
                    </textPath>
                  </text>
              <text className="text-[1.2rem] sm:text-[1.4rem] font-light fill-white/80" fontSize="1.6" fontWeight="300">
                    <textPath href="#circlePath" startOffset="12.5%">
                      APIs
                    </textPath>
                  </text>
                  <text className="text-[1.2rem] sm:text-[1.4rem] font-light fill-white/80" fontSize="1.6" fontWeight="300">
                    <textPath href="#circlePath" startOffset="25%">
                      Logic
                    </textPath>
                  </text>
                  <text className="text-[1.2rem] sm:text-[1.4rem] font-light fill-white/80" fontSize="1.6" fontWeight="300">
                    <textPath href="#circlePath" startOffset="37.5%">
                      Access
                    </textPath>
                  </text>
                  <text className="text-[1.2rem] sm:text-[1.4rem] font-light fill-white/80" fontSize="1.6" fontWeight="300">
                    <textPath href="#circlePath" startOffset="50%">
                      Storage
                    </textPath>
                  </text>
                  <text className="text-[1.2rem] sm:text-[1.4rem] font-light fill-white/80" fontSize="1.6" fontWeight="300">
                    <textPath href="#circlePath" startOffset="62.5%">
                      Workflow
                    </textPath>
                  </text>
                  <text className="text-[1.2rem] sm:text-[1.4rem] font-light fill-white/80" fontSize="1.6" fontWeight="300">
                    <textPath href="#circlePath" startOffset="75%">
                      Integration
                    </textPath>
                  </text>
                  <text className="text-[1.2rem] sm:text-[1.4rem] font-light fill-white/80" fontSize="1.6" fontWeight="300">
                    <textPath href="#circlePath" startOffset="87.5%">
                      Intelligence
                    </textPath>
                  </text>
                </svg>

                {/* Image container — fades in from bottom on mount with glassmorphism */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`relative w-[90%] h-[90%] rounded-full overflow-hidden bg-white/10 ring-1 ring-white/20 backdrop-blur-sm transition-all duration-1000 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}>
                    <Image
                      src="https://res.cloudinary.com/djdbcoyot/image/upload/v1780907194/kt4jthjfzjubohpwemci.png"
                      alt="Enoch Chukwudi"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-10 md:mb-20 -mt-5">
              <h1 className="text-4xl font-normal tracking-tight text-white sm:text-5xl lg:text-6xl animate-slide-in-left">
                Enoch Chukwudi
              </h1>
              <p className="mt-6 text-2xl sm:text-3xl md:text-4xl tracking-wide text-white/80 animate-slide-in-right" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
                <span className="font-light">Fullstack Engineer</span>
                <span className="block text-base sm:text-lg md:text-xl text-white/50 font-thin"> (Backend-Focused)</span>
              </p>
              <p className="mt-8 text-base md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto animate-fade-in-center" style={{ animationDelay: "0.4s", animationFillMode: "backwards" }}>
                Shipping end to end operational systems across web apps, mobile apps, dashboards, and desktop software using modern web technologies.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-10 animate-fade-in-center max-w-sm mx-auto mb-3 pb-6 -pt-6 md:mb-0" style={{ animationDelay: "0.6s", animationFillMode: "backwards" }}>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white text-black text-sm font-semibold tracking-[0.05em] hover:bg-white/90 transition-all duration-200"
                >
                  Contact
                </a>
                <a
                  href="#projects"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-full border border-white/30 bg-white/10 text-white text-sm font-semibold tracking-[0.05em] hover:bg-white hover:text-black transition-all duration-200"
                >
                  View Projects
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}