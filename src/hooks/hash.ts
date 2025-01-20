import { getWindow } from "@/utils/window";

// TODO: refer old sdk repo. include locally in project
import { useSafeEffect } from "@citizenwallet/sdk";
import { useState } from "react";

export const getHash = () => getWindow()?.location.hash ?? "";

export const useHash = () => {
  const [hash, setHash] = useState(getHash());

  useSafeEffect(() => {
    const onHashChange = () => {
      setHash(getHash());
    };

    getWindow()?.addEventListener("hashchange", onHashChange);
    onHashChange();

    return () => {
      getWindow()?.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return hash;
};
