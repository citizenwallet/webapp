"use client";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SessionTypes } from "@walletconnect/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLinkIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import WalletKitService from "@/services/walletkit";
import { useWalletKit } from "@/state/wallet_kit/actions";
import { getSdkError } from "@walletconnect/utils";

const session1: SessionTypes.Struct = {
  relay: {
    protocol: "irn",
  },
  namespaces: {
    eip155: {
      chains: ["eip155:100"],
      methods: ["eth_sendTransaction", "personal_sign"],
      events: ["accountsChanged", "chainChanged"],
      accounts: ["eip155:100:0xaFaE5f254B7fEC4C06c75E3Ee490E12311CDA792"],
    },
  },
  controller:
    "c71f5d334f5b57811849f86f2a30587a3e5235a8e92a3d1acce1124039f32655",
  expiry: 1738233868,
  topic: "641cee7fe876f2050f26863527c5ba25a1f4c45451bc9f424d2625ac43f10084",
  requiredNamespaces: {},
  optionalNamespaces: {
    eip155: {
      chains: ["eip155:100"],
      methods: [
        "eth_accounts",
        "eth_requestAccounts",
        "eth_sendRawTransaction",
        "eth_sign",
        "eth_signTransaction",
        "eth_signTypedData",
        "eth_signTypedData_v3",
        "eth_signTypedData_v4",
        "eth_sendTransaction",
        "personal_sign",
        "wallet_switchEthereumChain",
        "wallet_addEthereumChain",
        "wallet_getPermissions",
        "wallet_requestPermissions",
        "wallet_registerOnboarding",
        "wallet_watchAsset",
        "wallet_scanQRCode",
      ],
      events: [
        "chainChanged",
        "accountsChanged",
        "message",
        "disconnect",
        "connect",
      ],
    },
  },
  pairingTopic:
    "1050e601b505bb3c05470cb183e158fd89737a8e3fd087dceddb17d6cf52382a",
  acknowledged: false,
  self: {
    publicKey:
      "c71f5d334f5b57811849f86f2a30587a3e5235a8e92a3d1acce1124039f32655",
    metadata: {
      name: "Breadchain Community Token",
      description:
        "BREAD is a digital community token and solidarity primitive developed by Breadchain Cooperative that generates yield for post-capitalist organizations",
      url: "https://breadchain.xyz/",
      icons: ["https://bread.citizenwallet.xyz/uploads/logo.svg"],
      redirect: {
        linkMode: false,
      },
    },
  },
  peer: {
    publicKey:
      "6d59926e0be3591ac7b8b6469728092f240a370a37aa2b1c652afa6a8d96b747",
    metadata: {
      description: "Bake and burn BREAD. Fund post-capitalist web3.",
      url: "https://app.breadchain.xyz",
      icons: [
        "https://app.breadchain.xyz/favicon.ico",
        "https://app.breadchain.xyz/apple-touch-icon.png",
        "https://app.breadchain.xyz/favicon-32x32.png",
        "https://app.breadchain.xyz/favicon-16x16.png",
        "https://app.breadchain.xyz/safari-pinned-tab.svg",
      ],
      name: "Bread Crowdstaking",
    },
  },
  transportType: "relay",
};

const session2: SessionTypes.Struct = {
  relay: {
    protocol: "irn",
  },
  namespaces: {
    eip155: {
      chains: ["eip155:100"],
      methods: ["eth_sendTransaction", "personal_sign"],
      events: ["accountsChanged", "chainChanged"],
      accounts: ["eip155:100:0xaFaE5f254B7fEC4C06c75E3Ee490E12311CDA792"],
    },
  },
  controller:
    "c71f5d334f5b57811849f86f2a30587a3e5235a8e92a3d1acce1124039f32655",
  expiry: 1738233868,
  topic: "641cee7fe876f2050f26863527c5ba25a1f4c45451bc9f424d2625ac43f10084",
  requiredNamespaces: {},
  optionalNamespaces: {
    eip155: {
      chains: ["eip155:100"],
      methods: [
        "eth_accounts",
        "eth_requestAccounts",
        "eth_sendRawTransaction",
        "eth_sign",
        "eth_signTransaction",
        "eth_signTypedData",
        "eth_signTypedData_v3",
        "eth_signTypedData_v4",
        "eth_sendTransaction",
        "personal_sign",
        "wallet_switchEthereumChain",
        "wallet_addEthereumChain",
        "wallet_getPermissions",
        "wallet_requestPermissions",
        "wallet_registerOnboarding",
        "wallet_watchAsset",
        "wallet_scanQRCode",
      ],
      events: [
        "chainChanged",
        "accountsChanged",
        "message",
        "disconnect",
        "connect",
      ],
    },
  },
  pairingTopic:
    "1050e601b505bb3c05470cb183e158fd89737a8e3fd087dceddb17d6cf52382a",
  acknowledged: false,
  self: {
    publicKey:
      "c71f5d334f5b57811849f86f2a30587a3e5235a8e92a3d1acce1124039f32655",
    metadata: {
      name: "Breadchain Community Token",
      description:
        "BREAD is a digital community token and solidarity primitive developed by Breadchain Cooperative that generates yield for post-capitalist organizations",
      url: "https://breadchain.xyz/",
      icons: ["https://bread.citizenwallet.xyz/uploads/logo.svg"],
      redirect: {
        linkMode: false,
      },
    },
  },
  peer: {
    publicKey:
      "6d59926e0be3591ac7b8b6469728092f240a370a37aa2b1c652afa6a8d96b747",
    metadata: {
      description: "Bake and burn BREAD. Fund post-capitalist web3.",
      url: "https://app.breadchain.xyz",
      icons: ["https://robohash.org/AAA.png"],
      name: "Bread Crowdstaking",
    },
  },
  transportType: "relay",
};

const session3: SessionTypes.Struct = {
  relay: {
    protocol: "irn",
  },
  namespaces: {
    eip155: {
      chains: ["eip155:100"],
      methods: ["eth_sendTransaction", "personal_sign"],
      events: ["accountsChanged", "chainChanged"],
      accounts: ["eip155:100:0xaFaE5f254B7fEC4C06c75E3Ee490E12311CDA792"],
    },
  },
  controller:
    "c71f5d334f5b57811849f86f2a30587a3e5235a8e92a3d1acce1124039f32655",
  expiry: 1738233868,
  topic: "641cee7fe876f2050f26863527c5ba25a1f4c45451bc9f424d2625ac43f10084",
  requiredNamespaces: {},
  optionalNamespaces: {
    eip155: {
      chains: ["eip155:100"],
      methods: [
        "eth_accounts",
        "eth_requestAccounts",
        "eth_sendRawTransaction",
        "eth_sign",
        "eth_signTransaction",
        "eth_signTypedData",
        "eth_signTypedData_v3",
        "eth_signTypedData_v4",
        "eth_sendTransaction",
        "personal_sign",
        "wallet_switchEthereumChain",
        "wallet_addEthereumChain",
        "wallet_getPermissions",
        "wallet_requestPermissions",
        "wallet_registerOnboarding",
        "wallet_watchAsset",
        "wallet_scanQRCode",
      ],
      events: [
        "chainChanged",
        "accountsChanged",
        "message",
        "disconnect",
        "connect",
      ],
    },
  },
  pairingTopic:
    "1050e601b505bb3c05470cb183e158fd89737a8e3fd087dceddb17d6cf52382a",
  acknowledged: false,
  self: {
    publicKey:
      "c71f5d334f5b57811849f86f2a30587a3e5235a8e92a3d1acce1124039f32655",
    metadata: {
      name: "Breadchain Community Token",
      description:
        "BREAD is a digital community token and solidarity primitive developed by Breadchain Cooperative that generates yield for post-capitalist organizations",
      url: "https://breadchain.xyz/",
      icons: ["https://bread.citizenwallet.xyz/uploads/logo.svg"],
      redirect: {
        linkMode: false,
      },
    },
  },
  peer: {
    publicKey:
      "6d59926e0be3591ac7b8b6469728092f240a370a37aa2b1c652afa6a8d96b747",
    metadata: {
      description: "Bake and burn BREAD. Fund post-capitalist web3.",
      url: "https://app.breadchain.xyz",
      icons: ["https://robohash.org/BBB.png"],
      name: "Bread Crowdstaking",
    },
  },
  transportType: "relay",
};

const session4: SessionTypes.Struct = {
  relay: {
    protocol: "irn",
  },
  namespaces: {
    eip155: {
      chains: ["eip155:100"],
      methods: ["eth_sendTransaction", "personal_sign"],
      events: ["accountsChanged", "chainChanged"],
      accounts: ["eip155:100:0xaFaE5f254B7fEC4C06c75E3Ee490E12311CDA792"],
    },
  },
  controller:
    "c71f5d334f5b57811849f86f2a30587a3e5235a8e92a3d1acce1124039f32655",
  expiry: 1738233868,
  topic: "641cee7fe876f2050f26863527c5ba25a1f4c45451bc9f424d2625ac43f10084",
  requiredNamespaces: {},
  optionalNamespaces: {
    eip155: {
      chains: ["eip155:100"],
      methods: [
        "eth_accounts",
        "eth_requestAccounts",
        "eth_sendRawTransaction",
        "eth_sign",
        "eth_signTransaction",
        "eth_signTypedData",
        "eth_signTypedData_v3",
        "eth_signTypedData_v4",
        "eth_sendTransaction",
        "personal_sign",
        "wallet_switchEthereumChain",
        "wallet_addEthereumChain",
        "wallet_getPermissions",
        "wallet_requestPermissions",
        "wallet_registerOnboarding",
        "wallet_watchAsset",
        "wallet_scanQRCode",
      ],
      events: [
        "chainChanged",
        "accountsChanged",
        "message",
        "disconnect",
        "connect",
      ],
    },
  },
  pairingTopic:
    "1050e601b505bb3c05470cb183e158fd89737a8e3fd087dceddb17d6cf52382a",
  acknowledged: false,
  self: {
    publicKey:
      "c71f5d334f5b57811849f86f2a30587a3e5235a8e92a3d1acce1124039f32655",
    metadata: {
      name: "Breadchain Community Token",
      description:
        "BREAD is a digital community token and solidarity primitive developed by Breadchain Cooperative that generates yield for post-capitalist organizations",
      url: "https://breadchain.xyz/",
      icons: ["https://bread.citizenwallet.xyz/uploads/logo.svg"],
      redirect: {
        linkMode: false,
      },
    },
  },
  peer: {
    publicKey:
      "6d59926e0be3591ac7b8b6469728092f240a370a37aa2b1c652afa6a8d96b747",
    metadata: {
      description: "Bake and burn BREAD. Fund post-capitalist web3.",
      url: "https://app.breadchain.xyz",
      icons: ["https://robohash.org/CCC.png"],
      name: "Bread Crowdstaking",
    },
  },
  transportType: "relay",
};

const session5: SessionTypes.Struct = {
  relay: {
    protocol: "irn",
  },
  namespaces: {
    eip155: {
      chains: ["eip155:100"],
      methods: ["eth_sendTransaction", "personal_sign"],
      events: ["accountsChanged", "chainChanged"],
      accounts: ["eip155:100:0xaFaE5f254B7fEC4C06c75E3Ee490E12311CDA792"],
    },
  },
  controller:
    "c71f5d334f5b57811849f86f2a30587a3e5235a8e92a3d1acce1124039f32655",
  expiry: 1738233868,
  topic: "641cee7fe876f2050f26863527c5ba25a1f4c45451bc9f424d2625ac43f10084",
  requiredNamespaces: {},
  optionalNamespaces: {
    eip155: {
      chains: ["eip155:100"],
      methods: [
        "eth_accounts",
        "eth_requestAccounts",
        "eth_sendRawTransaction",
        "eth_sign",
        "eth_signTransaction",
        "eth_signTypedData",
        "eth_signTypedData_v3",
        "eth_signTypedData_v4",
        "eth_sendTransaction",
        "personal_sign",
        "wallet_switchEthereumChain",
        "wallet_addEthereumChain",
        "wallet_getPermissions",
        "wallet_requestPermissions",
        "wallet_registerOnboarding",
        "wallet_watchAsset",
        "wallet_scanQRCode",
      ],
      events: [
        "chainChanged",
        "accountsChanged",
        "message",
        "disconnect",
        "connect",
      ],
    },
  },
  pairingTopic:
    "1050e601b505bb3c05470cb183e158fd89737a8e3fd087dceddb17d6cf52382a",
  acknowledged: false,
  self: {
    publicKey:
      "c71f5d334f5b57811849f86f2a30587a3e5235a8e92a3d1acce1124039f32655",
    metadata: {
      name: "Breadchain Community Token",
      description:
        "BREAD is a digital community token and solidarity primitive developed by Breadchain Cooperative that generates yield for post-capitalist organizations",
      url: "https://breadchain.xyz/",
      icons: ["https://bread.citizenwallet.xyz/uploads/logo.svg"],
      redirect: {
        linkMode: false,
      },
    },
  },
  peer: {
    publicKey:
      "6d59926e0be3591ac7b8b6469728092f240a370a37aa2b1c652afa6a8d96b747",
    metadata: {
      description: "Bake and burn BREAD. Fund post-capitalist web3.",
      url: "https://app.breadchain.xyz",
      icons: ["https://robohash.org/DDD.png"],
      name: "Bread Crowdstaking",
    },
  },
  transportType: "relay",
};

const session6: SessionTypes.Struct = {
  relay: {
    protocol: "irn",
  },
  namespaces: {
    eip155: {
      chains: ["eip155:100"],
      methods: ["eth_sendTransaction", "personal_sign"],
      events: ["accountsChanged", "chainChanged"],
      accounts: ["eip155:100:0xaFaE5f254B7fEC4C06c75E3Ee490E12311CDA792"],
    },
  },
  controller:
    "c71f5d334f5b57811849f86f2a30587a3e5235a8e92a3d1acce1124039f32655",
  expiry: 1738233868,
  topic: "641cee7fe876f2050f26863527c5ba25a1f4c45451bc9f424d2625ac43f10084",
  requiredNamespaces: {},
  optionalNamespaces: {
    eip155: {
      chains: ["eip155:100"],
      methods: [
        "eth_accounts",
        "eth_requestAccounts",
        "eth_sendRawTransaction",
        "eth_sign",
        "eth_signTransaction",
        "eth_signTypedData",
        "eth_signTypedData_v3",
        "eth_signTypedData_v4",
        "eth_sendTransaction",
        "personal_sign",
        "wallet_switchEthereumChain",
        "wallet_addEthereumChain",
        "wallet_getPermissions",
        "wallet_requestPermissions",
        "wallet_registerOnboarding",
        "wallet_watchAsset",
        "wallet_scanQRCode",
      ],
      events: [
        "chainChanged",
        "accountsChanged",
        "message",
        "disconnect",
        "connect",
      ],
    },
  },
  pairingTopic:
    "1050e601b505bb3c05470cb183e158fd89737a8e3fd087dceddb17d6cf52382a",
  acknowledged: false,
  self: {
    publicKey:
      "c71f5d334f5b57811849f86f2a30587a3e5235a8e92a3d1acce1124039f32655",
    metadata: {
      name: "Breadchain Community Token",
      description:
        "BREAD is a digital community token and solidarity primitive developed by Breadchain Cooperative that generates yield for post-capitalist organizations",
      url: "https://breadchain.xyz/",
      icons: ["https://bread.citizenwallet.xyz/uploads/logo.svg"],
      redirect: {
        linkMode: false,
      },
    },
  },
  peer: {
    publicKey:
      "6d59926e0be3591ac7b8b6469728092f240a370a37aa2b1c652afa6a8d96b747",
    metadata: {
      description: "Bake and burn BREAD. Fund post-capitalist web3.",
      url: "https://app.breadchain.xyz",
      icons: ["https://robohash.org/EEE.png"],
      name: "Bread Crowdstaking",
    },
  },
  transportType: "relay",
};

const sizeClasses = {
  sm: "h-6 w-6 border-[1.5px] text-xs",
  md: "h-8 w-8 border-2 text-sm",
  lg: "h-10 w-10 border-2 text-base",
};

interface ActiveSessionsModalProps {
  trigger: React.ReactNode;
}

export default function ActiveSessionModal({
  trigger,
}: ActiveSessionsModalProps) {
  const [open, setOpen] = React.useState(false);

  const [state] = useWalletKit();

  const activeSessions = state((state) => state.activeSessions);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{trigger}</div>
      </DialogTrigger>

      <DialogContent className="w-full h-full sm:h-auto sm:max-w-md sm:rounded-lg rounded-none p-6 sm:p-6 flex flex-col">
        <DialogHeader className="text-left space-y-2">
          <DialogTitle className="text-xl sm:text-lg">
            Active Sessions
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="px-1 py-2">
            {Object.entries(activeSessions).map(([key, session]) => (
              <SessionListItem key={key} session={session} />
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2 mt-6 sm:mt-4">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto order-2 sm:order-1 h-11 sm:h-9"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SessionListItemProps {
  session: SessionTypes.Struct;
}

const SessionListItem = ({ session }: SessionListItemProps) => {
  const walletKit = WalletKitService.getWalletKit();

  const dApp = session.peer;

  const {
    publicKey,
    metadata: { icons, name, description, url },
  } = dApp;

  const icon = icons.find((icon) => icon.endsWith(".png"));

  const onRemove = () => {
    if (!walletKit) {
      console.warn("WalletKit not initialized");
      return;
    }

    walletKit.disconnectSession({
      topic: session.topic,
      reason: getSdkError("USER_DISCONNECTED"),
    });
  };

  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex items-center min-w-0 flex-1 pr-2">
        <Avatar
          key={publicKey}
          className={cn(
            "ring-2 ring-background border-primary relative rounded-full bg-white mr-2 flex-shrink-0",
            sizeClasses["md"] // Using medium size for better small screen experience
          )}
        >
          <AvatarImage src={icon} alt={`${name}'s avatar`} />
          <AvatarFallback>
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 overflow-hidden flex-1">
          <h2 className="text-sm font-semibold text-gray-900 truncate mb-0.5">
            {name}
          </h2>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer hover:bg-blue-50 rounded-full py-0.5 px-1 max-w-full self-start overflow-hidden"
          >
            <span className="truncate max-w-[120px] sm:max-w-[200px]">
              {url}
            </span>
            <ExternalLinkIcon size={12} className="flex-shrink-0" />
          </a>
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-700 p-1 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0"
        onClick={onRemove}
      >
        <X size={12} />
      </Button>
    </div>
  );
};
