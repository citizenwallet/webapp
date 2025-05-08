export const formatDate = (date: Date) => {
  const formattedDate = new Intl.DateTimeFormat(
    typeof navigator === "undefined" ? "en-US" : navigator.language,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      //   hour12: true,
    },
  ).format(new Date(date));

  return formattedDate;
};
