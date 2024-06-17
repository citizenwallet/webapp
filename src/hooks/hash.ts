import { useSafeEffect } from "@citizenwallet/sdk";
import { useState } from "react";

export const getHash = () =>
  typeof window !== "undefined" ? window.location.hash : "";

export const useHash = () => {
  const [hash, setHash] = useState(getHash());

  useSafeEffect(() => {
    const onHashChange = () => {
      setHash(getHash());
    };

    window.addEventListener("hashchange", onHashChange);
    onHashChange();

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return hash;
};
