export const getFullUrl = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.href;
};
