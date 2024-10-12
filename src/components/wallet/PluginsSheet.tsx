import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Config } from "@citizenwallet/sdk";

interface PluginsSheetProps {
  account: string;
  plugins: Config["plugins"];
  children: React.ReactNode;
}

export default function PluginsSheet({
  account,
  plugins = [],
  children,
}: PluginsSheetProps) {
  const handlePluginClick = (url: string) => {
    const baseUrl = new URL(window.location.href).origin;
    const fullUrl = `${url}?account=${account}&redirectUrl=${encodeURIComponent(
      baseUrl
    )}`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Plugins</SheetTitle>
          <SheetDescription>Select a plugin to use</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {plugins.map((plugin, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handlePluginClick(plugin.url)}
            >
              <Image
                src={plugin.icon}
                alt={plugin.name}
                width={24}
                height={24}
                className="mr-2"
              />
              {plugin.name}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
