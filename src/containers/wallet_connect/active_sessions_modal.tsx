"use client";
import {forwardRef, useImperativeHandle, useState} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SessionTypes } from "@walletconnect/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

export interface ActiveSessionsModalRef {
  toggle: () => void;
}

export const ActiveSessionsModal = forwardRef((_, ref) => {
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    toggle: () => setOpen((prev) => !prev),
  }));

  const [state] = useWalletKit();

  const activeSessions = state((state) => state.activeSessions);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Active sessions</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[50vh] w-full">
          {Object.entries(activeSessions).map(([key, session]) => (
            <SessionListItem key={key} session={session} />
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});

ActiveSessionsModal.displayName = "ActiveSessionsModal";

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
    <div className="grid grid-cols-[auto,1fr,auto] items-center hover:bg-gray-100 p-2">
      <Avatar
        key={publicKey}
        className={cn(
          "ring-2 ring-background border-primary relative inline-block rounded-full bg-white mr-2",
          sizeClasses["lg"],
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
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
        <div className="flex justify-between items-baseline">
          <h2 className="text-sm font-semibold text-gray-900 truncate">
            {name}
          </h2>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 transition-colors cursor-pointer hover:bg-blue-200 rounded-full max-w-full self-start"
        >
          <span className="truncate max-w-[200px]">{url}</span>
          <ExternalLinkIcon size={16} />
        </a>
      </div>
      <Button
        variant="outline"
        className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-700 p-1 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0"
        onClick={onRemove}
      >
        <X size={16} />
      </Button>
    </div>
  );
};
