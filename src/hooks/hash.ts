import { useSafeEffect } from "@citizenwallet/sdk";
import { useState } from "react";

export const useHash = () => {
  const [hash, setHash] = useState(window.location.hash);

  useSafeEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash);
    };

    window.addEventListener("hashchange", onHashChange);
    onHashChange();

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return hash;
};
