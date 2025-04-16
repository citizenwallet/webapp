'use client'

import Link from "next/link"




export default function Back() {
  return (
    <Link
      href="/signin"
      className="text-sm text-muted-foreground"
    >
      Back to sign in options
    </Link>
  );
}