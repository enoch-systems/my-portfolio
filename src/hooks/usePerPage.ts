"use client";

import { useEffect, useState } from "react";

/**
 * Returns the number of items to show per page based on screen width.
 * - md (768-1023): 9 items
 * - default (sm, lg+): 8 items
 */
export function usePerPage() {
  const [perPage, setPerPage] = useState(8);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 768 && w < 1024) setPerPage(9);
      else setPerPage(8);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return perPage;
}