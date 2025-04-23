import { CommunityConfig } from "@citizenwallet/sdk";
import { getCommunityFromHeaders } from "@/services/config";
import { headers } from "next/headers";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SignInEmail from "./_components/signin-email";
import SignInPasskey from "./_components/signin-passkey";

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

  const communityConfig = new CommunityConfig(config);

  const logoUrl = communityConfig.community.logo;
  const communityName = communityConfig.community.name;
  const tokenSymbol = communityConfig.primaryToken.symbol;

  return (
    <Card className="w-full">
      <div className="flex flex-col items-center pt-6">
        <Avatar className="h-24 w-24 border border-muted bg-background">
          {logoUrl ? (
            <AvatarImage
              src={logoUrl}
              alt={communityName}
              className="object-contain p-1"
            />
          ) : (
            <AvatarFallback className="bg-primary/10">
              {tokenSymbol}
            </AvatarFallback>
          )}
        </Avatar>

        <p className="mt-2 text-lg font-medium">{communityName}</p>
      </div>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Sign In
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignInEmail config={config} />
        <SignInPasskey config={config} />
      </CardContent>
    </Card>
  );
}
