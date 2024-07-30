import Passkeys from "@/containers/passkeys";
import React, { Suspense } from "react";

export default async function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Passkeys />
    </Suspense>
  );
}
