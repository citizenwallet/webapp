"use client";

import { Config } from "@citizenwallet/sdk";
import { useSigninMethod } from "@/hooks/signin-method";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import SignInEmail from "./signin-email";
import SignInPasskey from "./signin-passkey";
import SignInLocal from "./signin-local";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommunityConfig } from "@citizenwallet/sdk";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PageClientProps {
  config: Config;
}

export default function PageClient({ config }: PageClientProps) {
  const communityConfig = new CommunityConfig(config);
  const logoUrl = communityConfig.community.logo;
  const communityName = communityConfig.community.name;
  const tokenSymbol = communityConfig.primaryToken.symbol;

  const router = useRouter();
  const { isSessionExpired, accountAddress, isLoading } =
    useSigninMethod(config);

  useEffect(() => {
    if (accountAddress && !isSessionExpired) {
      // Redirect to account page when we have an address
      router.replace(`/${accountAddress}`);
      return;
    }
  }, [accountAddress, isSessionExpired, router]);

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
          {isLoading ? "Signing in..." : "Sign In"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <SkeletonButton />
            <SkeletonButton />
            <SkeletonButton />
          </>
        ) : (
          <>
            <SignInEmail config={config} />
            <SignInPasskey config={config} />
            <SignInLocal config={config} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SkeletonButton() {
  return (
    <Skeleton className={cn("w-full h-11", "rounded-md", "animate-pulse")} />
  );
}
