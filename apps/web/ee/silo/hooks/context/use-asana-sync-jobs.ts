import { useContext } from "react";
import type { AsanaConfig } from "@plane/etl/asana";
// silo contexts
import type { TImporterCreateContext } from "@/plane-web/silo/contexts";
import { ImporterSyncJobContext } from "@/plane-web/silo/contexts";

export function useAsanaSyncJobs() {
  const context = useContext<TImporterCreateContext<AsanaConfig>>(ImporterSyncJobContext);

  if (!context) {
    throw new Error("useAsanaSyncJobs must be used within an ImporterSyncJobContextProvider");
  }

  return context;
}
