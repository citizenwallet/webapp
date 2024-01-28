import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import StyledComponentsRegistry from "@/components";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Citizen Wallet",
  description: "A wallet for your community.",
  appLinks: {
    ios: {
      app_name: "Citizen Wallet",
      app_store_id: "123456789",
      url: "https://citizenwallet.xyz",
    },
    android: {
      package: "xyz.citizenwallet.wallet",
      url: "https://citizenwallet.xyz",
    },
  },
  openGraph: {
    type: "website",
    url: "https://citizenwallet.xyz",
    title: "Citizen Wallet",
    description: "A wallet for your community.",
    siteName: "Citizen Wallet",
    images: [
      {
        url: "/logo_rounded.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
