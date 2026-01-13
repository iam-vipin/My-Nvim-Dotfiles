import { useContext } from "react";
// context
import { StoreContext } from "@/lib/store-context";
// plane web stores
import type { IAgentStore } from "@/plane-web/store/agent";

export const useAgent = (): IAgentStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useAgent must be used within StoreProvider");
  return context.agent;
};
