import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/providers/LenisProvider";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Enoch Chukwudi - Fullstack Engineer (Backend-Focused)",
  description: "Shipping end to end operational systems across web apps, mobile apps, dashboards, and desktop software using modern web technologies.",
  keywords: ["Software Engineer", "Product Designer", "Web Developer", "Full Stack", "React", "Next.js", "TypeScript"],
  authors: [{ name: "Enoch Chukwudi" }],
  creator: "Enoch Chukwudi",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://enochchukwudi.com",
    title: "Enochsystems - Fullstack Engineer (Backend-Focused)",
    description: "Shipping end to end operational systems across web apps, mobile apps, dashboards, and desktop software using modern web technologies.",
    siteName: "Enochsystems Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enochsystems - Fullstack Engineer (Backend-Focused)",
    description: "Shipping end to end operational systems across web apps, mobile apps, dashboards, and desktop software using modern web technologies.",
    creator: "@enochchukwudi",
  },
  icons: {
    icon: "https://res.cloudinary.com/djdbcoyot/image/upload/v1780951883/hukdooivxlvjfk7pcuvq.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <LenisProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </LenisProvider>
      </body>
    </html>
  );
}