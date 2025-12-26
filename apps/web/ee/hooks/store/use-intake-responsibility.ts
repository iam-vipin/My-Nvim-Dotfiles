import { useContext } from "react";
// context
import { StoreContext } from "@/lib/store-context";
// plane web stores
import type { IIntakeResponsibilityStore } from "@/plane-web/store/intake-responsibility.store";

export const useIntakeResponsibility = (): IIntakeResponsibilityStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useIntakeResponsibility must be used within StoreProvider");
  return context.intakeResponsibility;
};
