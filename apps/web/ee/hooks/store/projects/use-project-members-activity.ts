import { useContext } from "react";
// context
import { StoreContext } from "@/lib/store-context";
// plane web stores
import type { IProjectMembersActivityStore } from "@/plane-web/store/project-members-activity.store";

export const useProjectMembersActivity = (): IProjectMembersActivityStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useProjectMembersActivity must be used within StoreProvider");
  return context.projectMembersActivityStore;
};
