import { useCallback, useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD = 100;
const SCROLL_BUMP = 100; // Bump to avoid flickering

export const useIsScrolled = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const previousIsScrolled = useRef(false);
  const scrollY = useRef(0);

  const handleScroll = useCallback(() => {
    console.log("window.scrollY", window.scrollY);

    // If the scroll position hasn't changed, return early
    if (scrollY.current === window.scrollY) {
      return;
    }

    const hasScrolled = window.scrollY > SCROLL_THRESHOLD;
    if (previousIsScrolled.current === hasScrolled) {
      return;
    }

    const diff = window.scrollY - SCROLL_THRESHOLD;
    if (
      (hasScrolled && diff < SCROLL_BUMP) ||
      (!hasScrolled && diff > -SCROLL_BUMP)
    ) {
      return;
    }

    setIsScrolled(hasScrolled);

    previousIsScrolled.current = hasScrolled;

    scrollY.current = window.scrollY;
  }, []);

  useEffect(() => {
    // Add event listener for scroll
    window.addEventListener("scroll", handleScroll);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return isScrolled;
};
