import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JournalPage from "@/components/JournalPage";

export default function Journal() {
  return (
    <main className="relative min-h-screen bg-black">
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
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      <div className="relative z-10">
        <Navbar />
        <JournalPage />
        <Footer />
      </div>
    </main>
  );
}