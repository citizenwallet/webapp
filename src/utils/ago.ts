import TimeAgo from "javascript-time-ago";

// English.
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

// Create formatter (English).
const timeAgo = new TimeAgo("en-US");

export const ago = (date: Date) => timeAgo.format(date);

export const AGO_THRESHOLD = 1000 * 60 * 60 * 24 * 7;
