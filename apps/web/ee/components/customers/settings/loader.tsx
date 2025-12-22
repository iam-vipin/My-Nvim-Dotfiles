import type { FC } from "react";
import { Loader } from "@plane/ui";
export function CustomerPropertiesLoader() {
  return (
    <Loader className="space-y-4">
      <Loader.Item height="100px" width="100%" />
      <Loader.Item height="100px" width="100%" />
    </Loader>
  );
}
