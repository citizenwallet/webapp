"use client"

export const locale =
  typeof window !== "undefined" ? window?.navigator?.language || "en" : "en"
