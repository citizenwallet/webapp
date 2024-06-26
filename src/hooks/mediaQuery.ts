import { getWindow } from "@/utils/window";
import { useEffect, useState } from "react";

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const w = getWindow();
    if (!w) return;

    const mediaQueryList = w.matchMedia(query);
    const documentMatches = () => setMatches(mediaQueryList.matches);

    mediaQueryList.addEventListener("change", documentMatches);
    documentMatches();

    return () => {
      mediaQueryList.removeEventListener("change", documentMatches);
    };
  }, [query]);

  return matches;
};
