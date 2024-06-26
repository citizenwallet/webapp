export const getWindow = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window;
};
