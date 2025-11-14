import { useContext } from "react";
// mobx store
import { StoreContext } from "@/lib/store-context";
import type { IMilestoneStore } from "@/plane-web/store/milestones/milestone.store";

export const useMilestones = (): IMilestoneStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useMilestones must be used within StoreProvider");
  return context.milestone;
};
