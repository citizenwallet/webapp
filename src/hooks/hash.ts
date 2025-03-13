import { getWindow } from "@/utils/window";

import { useState } from "react";
import { useSafeEffect } from "@/hooks/useSafeEffect";

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
