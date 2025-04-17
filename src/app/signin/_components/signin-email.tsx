"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { Config } from "@citizenwallet/sdk";
import { cn } from "@/lib/utils";

interface SignInEmailProps {
  config: Config;
}

export default function SignInEmail({ config }: SignInEmailProps) {
  const primaryColor = config.community.theme?.primary ?? "#000000";

  const style = {
    backgroundColor: `${primaryColor}1A`, // 10% opacity
    borderColor: `${primaryColor}33`, // 20% opacity
    color: primaryColor,
  };

  return (
    <Link
      href="/signin/email"
      style={style}
      className={cn(
        "inline-flex w-full items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "border",
        "h-11 px-4 py-2",
        "gap-2.5",
        "hover:bg-opacity-20",
      )}
    >
      <Mail className="h-4 w-4" />
      <span>Sign in with Email</span>
    </Link>
  );
}
