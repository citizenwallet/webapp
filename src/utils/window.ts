export const getWindow = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window;
};

export const scrollToTop = () => {
  const w = getWindow();
  if (!w) return;
  w.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
