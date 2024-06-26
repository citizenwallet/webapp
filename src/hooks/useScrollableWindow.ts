import { MutableRefObject, useCallback, useRef } from "react";
import { delay } from "../utils/delay";
import { useSafeEffect } from "@citizenwallet/sdk";
import { getWindow } from "@/utils/window";

const FETCHER_THRESHOLD = 100;

/**
 * Custom hook that listens to scroll events on a given element and runs the fetch function when the end is reached.
 * It also checks if the element is scrollable and fetches data until it is.
 *
 * @param fetchFunction - The function that fetches data.
 * @param refetchDelay - The delay between each fetch attempt (default: 500ms).
 * @returns The ref to the scrollable element.
 */
export const useScrollableWindowFetcher = (
  fetchFunction: () => Promise<boolean>,
  refetchDelay = 500
): MutableRefObject<HTMLDivElement | null> => {
  const elementRef = useRef<HTMLDivElement | null>(null);

  const fetchUntilScrollable = useCallback(async () => {
    const el = elementRef.current;
    const isScrollable = isWindowScrollable(el);
    if (!isScrollable) {
      const hasMore = await fetchFunction();
      if (!hasMore) {
        return;
      }
      await delay(refetchDelay);
      fetchUntilScrollable();
      return;
    }
  }, [fetchFunction, refetchDelay]);

  useSafeEffect(() => {
    fetchUntilScrollable();

    const scrollListener = () => {
      const el = elementRef.current;

      if (!el) {
        return;
      }

      if (isAtBottom(el)) {
        fetchFunction();
      }
    };

    getWindow()?.addEventListener("scroll", scrollListener);

    return () => {
      getWindow()?.removeEventListener("scroll", scrollListener);
    };
  }, [fetchFunction, fetchUntilScrollable]);

  return elementRef;
};

export const isWindowScrollable = (el: HTMLDivElement | null) => {
  if (el && typeof window !== "undefined") {
    return el.scrollHeight > windowHeight() + FETCHER_THRESHOLD;
  }

  return false;
};

export const isAtBottom = (el: HTMLDivElement | null) => {
  if (el && typeof window !== "undefined") {
    const scrollThreshold = el.scrollHeight - FETCHER_THRESHOLD;
    if (scrollThreshold <= 0) {
      return true;
    }
    return windowScrollY() + windowHeight() >= scrollThreshold;
  }

  return false;
};

export const windowHeight = () =>
  getWindow()?.document.documentElement.clientHeight ?? 0;

export const windowScrollY = () => getWindow()?.scrollY ?? 0;
