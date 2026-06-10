"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  FolderKanban,
  BookOpen,
  LogOut,
  Sun,
  Moon,
  LayoutDashboard,
  AlertTriangle,
  X,
  Clock,
} from "lucide-react";
import { getTimeFormat, setTimeFormat } from "@/lib/settings";
import type { TimeFormat } from "@/lib/settings";

// Theme context
const ThemeContext = createContext<{
  theme: "light" | "dark";
  toggleTheme: () => void;
}>({ theme: "dark", toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>("24h");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
    setTimeFormatState(getTimeFormat());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("admin-theme", theme);
  }, [theme]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await supabase.auth.signOut();
    router.push("/admin");
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const toggleTimeFormat = () => {
    const next: TimeFormat = timeFormat === "12h" ? "24h" : "12h";
    setTimeFormat(next);
    setTimeFormatState(next);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-transparent animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  // Login form
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to manage your portfolio</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                required
              />
            </div>
            {error && (
              <div className="px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/admin/journal", label: "Journal", icon: BookOpen },
  ];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`min-h-screen ${theme === "dark" ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-40 h-full w-64 transform transition-transform duration-200 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 border-r ${
            theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar header */}
            <div className={`p-5 border-b ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className={`text-sm font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Portfolio</h2>
                  <p className={`text-[10px] ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>Admin Panel</p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40"
                        : `${theme === "dark" ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar footer */}
            <div className={`p-3 border-t ${theme === "dark" ? "border-gray-800" : "border-gray-200"}`}>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-colors cursor-pointer ${
                  theme === "dark" ? "text-gray-400 hover:text-red-400 hover:bg-red-500/10" : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="md:ml-64">
          {/* Top bar */}
          <header
            className={`sticky top-0 z-20 border-b ${
              theme === "dark" ? "bg-gray-950/80 backdrop-blur-xl border-gray-800" : "bg-white/80 backdrop-blur-xl border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between px-4 md:px-6 h-14">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="hidden md:flex items-center gap-2">
                <span className={`text-xs font-medium ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  {pathname === "/admin/projects" ? "Projects" : "Journal"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Time format toggle */}
                <button
                  onClick={toggleTimeFormat}
                  className={`px-2 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                    theme === "dark" ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                  }`}
                  title={timeFormat === "12h" ? "Switch to 24-hour format" : "Switch to 12-hour format"}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {timeFormat === "12h" ? "12h" : "24h"}
                </button>

                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    theme === "dark" ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                  }`}
                  title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Mobile logout */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className={`md:hidden p-2 rounded-lg transition-colors cursor-pointer ${
                    theme === "dark" ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>

        {/* Logout confirmation modal */}
        <ConfirmModal
          open={showLogoutConfirm}
          title="Logout"
          message="Are you sure you want to logout? You'll need to sign in again."
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      </div>
    </ThemeContext.Provider>
  );
}