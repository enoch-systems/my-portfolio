"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Detects when an element scrolls into the viewport.
 * Returns a ref to attach to the element and a boolean `visible` flag.
 *
 * @param threshold - Intersection ratio threshold (default 0.05)
 * @param options - Optional overrides for rootMargin, etc.
 */
export function useInView(
  threshold = 0.05,
  options?: { rootMargin?: string; triggerOnce?: boolean }
) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const triggerOnce = options?.triggerOnce ?? true;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (triggerOnce) observer.disconnect();
        } else if (!triggerOnce) {
          setVisible(false);
        }
      },
      {
        threshold,
        rootMargin: options?.rootMargin ?? "0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, triggerOnce, options?.rootMargin]);

  return [ref, visible] as const;
}