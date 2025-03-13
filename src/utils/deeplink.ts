export const getFullUrl = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.href;
};

export const getBaseUrl = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
};
