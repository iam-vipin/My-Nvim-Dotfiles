import { useContext } from "react";
// plane web context
import type { TIssuePropertyOptionsContext } from "@/plane-web/lib";
import { IssuePropertyOptionContext } from "@/plane-web/lib";

export const usePropertyOptions = (): TIssuePropertyOptionsContext => {
  const context = useContext(IssuePropertyOptionContext);
  if (context === undefined) throw new Error("usePropertyOptions must be used within IssuePropertyOptionsProvider");
  return context;
};
