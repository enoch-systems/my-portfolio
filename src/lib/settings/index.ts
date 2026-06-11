/**
 * Time format settings persisted in localStorage.
 */

const STORAGE_KEY = "portfolio-time-format";

export type TimeFormat = "12h" | "24h";

export function getTimeFormat(): TimeFormat {
  if (typeof window === "undefined") return "12h";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "12h" || stored === "24h") return stored;
  return "12h";
}

export function setTimeFormat(fmt: TimeFormat): void {
  localStorage.setItem(STORAGE_KEY, fmt);
}
