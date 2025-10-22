import { useContext } from "react";
import type { TUpdateEntityType } from "@plane/types";
import { EUpdateEntityType } from "@plane/types";
// mobx store
import { StoreContext } from "@/lib/store-context";
// types
import type { IUpdateStore } from "../store/updates/base.store";

export const useUpdateDetail = (serviceType: TUpdateEntityType): IUpdateStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useIssueDetail must be used within StoreProvider");
  if (serviceType === EUpdateEntityType.EPIC) return context.epicBaseStore.updatesStore;
  if (serviceType === EUpdateEntityType.INITIATIVE) return context.initiativeStore.updatesStore;
  else return context.epicBaseStore.updatesStore;
};
