import { getCommunityFromHeaders } from "@/services/config";
import { headers } from "next/headers";
import { Metadata } from "next";

import PageClient from "./_components/page-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const metadata: Metadata = {
    title: "Citizen Wallet",
    description: "The open source wallet for your community.",
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      title: "Citizen Wallet",
      description: "The open source wallet for your community.",
      images: ["/logo.png"],
    },
  };

  const headersList = await headers();

  const config = await getCommunityFromHeaders(headersList);
  if (!config) {
    return metadata;
  }

  metadata.title = config.community.name;
  metadata.description = config.community.description;
  metadata.openGraph = {
    title: config.community.name,
    description: config.community.description,
    images: [config.community.logo],
    type: "article",
  };

  return metadata;
}

export default async function Page() {
  const headersList = await headers();

  const config = await getCommunityFromHeaders(headersList);
  if (!config) {
    return <div>Community not found</div>;
  }

  return <PageClient config={config} />;
}
