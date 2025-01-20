import { DependencyList, EffectCallback } from "react";
import { useSafeEffect } from "./useSafeEffect";

// Custom hook to execute an effect when the page is focused.
export const useFocusEffect = (
  effect: EffectCallback, // The effect function to run when the page is focused.
  deps: DependencyList // Dependencies for the effect. If any change, the effect is re-run.
) => {
  // Use a custom version of useEffect that handles cleanup and dependencies safely.
  useSafeEffect(() => {
    // Function to handle visibility change events.
    const handleVisibilityChange = () => {
      // Check if the document is currently visible.
      if (document.visibilityState === "visible") {
        // If so, run the effect function and store any destructor it returns.
        destructor = effect();
      } else {
        // If the document is not visible and a destructor exists, call it for cleanup.
        if (destructor) {
          destructor();
        }
      }
    };

    // Variable to store a potential cleanup function returned by the effect.
    let destructor: any;

    // Run the effect immediately if the document is visible upon hook invocation.
    if (document.visibilityState === "visible") {
      destructor = effect();
    }

    // Register the visibility change event listener to handle page focus changes.
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Return a cleanup function that removes the event listener and calls the destructor.
    return () => {
      console.log("useFocusEffect destructor"); // Log cleanup for debugging.
      // Remove the visibility change event listener.
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // If a destructor exists, call it for cleanup.
      if (destructor) {
        destructor();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ts and react can't detect that this is correct
  }, deps); // Dependencies array to determine when to re-run the effect.
};
