import type { Metadata } from "next";
import { Theme } from "@radix-ui/themes";

import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Inter as FontSans } from "next/font/google";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Citizen Wallet",
  description:
    "Send and receive your community currency in your mobile browser",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen min-w-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Theme>
          <div className="flex flex-col items-center">{children}</div>
          <Toaster />
        </Theme>
      </body>
    </html>
  );
}
