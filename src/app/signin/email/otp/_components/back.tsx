"use client";

import Link from "next/link";

export default function Back() {
  return (
    <Link href="/signin/email" className="text-sm text-muted-foreground">
      Try different email
    </Link>
  );
}
