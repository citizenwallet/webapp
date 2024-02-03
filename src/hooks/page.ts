"use client";

import { throttle } from "throttle-debounce";
import { useEffect, useState } from "react";

interface PageDimensions {
  width: number;
  height: number;
}

export const useLocale = (): string => {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    const locale = window.navigator.language;
    setLocale(locale);
  }, []);

  return locale;
}

export const useScrollPosition = (): number => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = throttle(
      200,
      () => {
        const rect = document.body.getBoundingClientRect();
        setScrollPosition(rect.y * -1);
      },
      { noLeading: false, noTrailing: false }
    );

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition;
};

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
