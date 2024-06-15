import { useEffect, useState } from "react";

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const documentMatches = () => setMatches(mediaQueryList.matches);

    mediaQueryList.addEventListener("change", documentMatches);
    documentMatches();

    return () => {
      mediaQueryList.removeEventListener("change", documentMatches);
    };
  }, [query]);

  return matches;
};
