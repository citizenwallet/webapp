import Wallet from "@/containers/wallet";
import { Config, CommunityConfig } from "@citizenwallet/sdk";
import { getCommunityFromHeaders } from "@/services/config";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@radix-ui/themes";
import { QrCodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

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

export default async function Home() {
  const headersList = await headers();

  const config = await getCommunityFromHeaders(headersList);
  if (!config) {
    return <div>Community not found</div>;
  }

  return (
    <Suspense fallback={<FallBack config={config} />}>
      <Wallet config={config} />
    </Suspense>
  );
}

function FallBack({ config }: { config: Config }) {
  const communityConfig = new CommunityConfig(config);
  const primaryToken = communityConfig.primaryToken;

  return (
    <div className="relative flex min-h-screen w-full flex-col align-center p-4 max-w-xl">
      <div className="flex justify-between">
        <Skeleton className="h-11 w-11 rounded-full" />
        <Skeleton className="h-11 w-11 rounded-full" />
      </div>
      <div className="fixed top-0 w-full max-w-xl items-center justify-between text-sm pr-4">
        <div className="flex justify-center align-center w-full pt-4 pr-4 gap-2">
          <Skeleton className="h-28 w-28 rounded-full" />
        </div>
        <div className="flex justify-center align-center w-full pt-4 pr-4 gap-2">
          <Skeleton className="h-8 w-44" />
        </div>
        <div className="flex justify-center align-center w-full pt-4 pr-4 gap-2">
          <Skeleton className="h-10 w-24" />
          <Text size="6" weight="bold" className="text-muted-strong">
            {primaryToken.symbol}
          </Text>
        </div>
      </div>

      <div className="flex justify-center align-center z-20 fixed right-0 bottom-0 w-full mb-6 gap-2">
        <Button
          variant="ghost"
          className="h-20 w-20 rounded-full border-primary border-4 m-4 shadow-lg bg-white"
        >
          <QrCodeIcon size={40} className="text-primary" />
        </Button>
      </div>
    </div>
  );
}
