"use client";

import { useEffect, useState } from "react";

interface PageDimensions {
  width: number;
  height: number;
}

export const usePageDimensions = (
  { width = 0, height = 0 } = { width: 0, height: 0 }
): PageDimensions => {
  const [dimensions, setDimensions] = useState({
    height: typeof window !== "undefined" ? window.innerHeight : width,
    width: typeof window !== "undefined" ? window.innerWidth : height,
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return dimensions;
};
