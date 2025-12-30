import { useContext } from "react";
// store
import { StoreContext } from "@/providers/store.provider";
import type { IInstanceManagementStore } from "@/plane-admin/store/instance-management.store";

export const useInstanceManagement = (): IInstanceManagementStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useInstanceManagement must be used within StoreProvider");
  return context.instanceManagement;
};
