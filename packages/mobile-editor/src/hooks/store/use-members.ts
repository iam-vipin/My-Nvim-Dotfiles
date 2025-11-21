import { useContext } from "react";
// mobx store
import { StoreContext } from "@/lib/store-context";
// types
import { IMembersStore } from "@/store/members.store";

export const useMembers = (): IMembersStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useMembers must be used within StoreProvider");
  return context.members;
};
