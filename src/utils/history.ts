export const canGoBack = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return window.history.length > 1;
};
