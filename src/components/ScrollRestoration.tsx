"use client";
import { useEffect } from "react";

export default function ScrollRestoration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    // Delay scrollTo to run after the browser's scroll restoration
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  return null;
}