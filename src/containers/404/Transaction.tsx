"use client";

import { canGoBack } from "@/utils/history";
import { Flex, Heading } from "@radix-ui/themes";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Container() {
  const router = useRouter();

  const handleBack = () => {
    if (canGoBack()) {
      router.back();
      return;
    }

    // can't go back for some reason, go home
    router.replace("/");
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col justify-center align-center items-center p-4 max-w-xl gap-12">
      <Flex className="absolute top-0 left-0 h-10 p-4">
        <ArrowLeft
          className="active:bg-muted rounded-full"
          onClick={handleBack}
        />
      </Flex>
      <Image src="/404.svg" alt="404" width={200} height={200} />
      <Heading size="4" className="text-center">
        Could not find transfer
      </Heading>
    </main>
  );
}
