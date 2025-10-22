import { useContext } from "react";
import type { JiraConfig } from "@plane/etl/jira";
// silo contexts
import type { TImporterCreateContext } from "@/plane-web/silo/contexts";
import { ImporterSyncJobContext } from "@/plane-web/silo/contexts";

export function useJiraSyncJobs() {
  const context = useContext<TImporterCreateContext<JiraConfig>>(ImporterSyncJobContext);

  if (!context) {
    throw new Error("useJiraSyncJobs must be used within an ImporterSyncJobContextProvider");
  }

  return context;
}
