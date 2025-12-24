import { useContext } from "react";
// context
import { StoreContext } from "@/lib/store-context";
// plane web stores
import type { IWorkspaceMembersActivityStore } from "@/plane-web/store/workspace-members-activity.store";

export const useWorkspaceMembersActivity = (): IWorkspaceMembersActivityStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useWorkspaceMembersActivity must be used within StoreProvider");
  return context.workspaceMembersActivityStore;
};
