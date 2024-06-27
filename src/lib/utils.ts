import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvatarUrl(imageurl?: string, address?: string) {
  if (imageurl) return imageurl;
  if (address) return `https://api.multiavatar.com/${address}.png`;
  return "/anonymous-user.svg";
}
