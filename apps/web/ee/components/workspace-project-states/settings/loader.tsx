import type { FC } from "react";
import { Loader } from "@plane/ui";

export function WorkspaceProjectStatesLoader() {
  return (
    <Loader className="space-y-4">
      <Loader.Item height="47px" width="100%" />
      <Loader.Item height="47px" width="100%" />
      <Loader.Item height="47px" width="100%" />
      <Loader.Item height="47px" width="100%" />
      <Loader.Item height="47px" width="100%" />
    </Loader>
  );
}
