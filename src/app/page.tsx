import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import SocialSidebar from "@/components/layout/SocialSidebar";
import Layers from "@/components/sections/Layers";
import About from "@/components/sections/About";
import Projects from "@/components/projects/Projects";
import Journal from "@/components/journal/Journal";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
export default function Home() {
  return (
    <main className="relative min-h-screen bg-black">
      {/* Fixed background covering entire page */}
      <div className="fixed inset-0 bg-black/80" />
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: "url('https://res.cloudinary.com/djdbcoyot/image/upload/v1779492891/tvchvy2zbigbduggdlmi.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          filter: "blur(4px)",
          opacity: 0.6,
          transform: "scale(1.05)",
        }}
      />
      {/* Fixed gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      <div className="relative z-10">
        <Navbar />
        <Hero>
          <SocialSidebar />
        </Hero>
        <Layers />
        <About />
        <Suspense fallback={null}>
          <Projects />
        </Suspense>
        <Journal />
        <Contact />
        <Footer />
        <WhatsAppButton />
      </div>
    </main>
  );
}

