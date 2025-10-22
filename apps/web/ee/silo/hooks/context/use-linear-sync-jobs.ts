import { useContext } from "react";
import type { LinearConfig } from "@plane/etl/linear";
// silo contexts
import type { TImporterCreateContext } from "@/plane-web/silo/contexts";
import { ImporterSyncJobContext } from "@/plane-web/silo/contexts";

export function useLinearSyncJobs() {
  const context = useContext<TImporterCreateContext<LinearConfig>>(ImporterSyncJobContext);

  if (!context) {
    throw new Error("useLinearSyncJobs must be used within an ImporterSyncJobContextProvider");
  }

  return context;
}
