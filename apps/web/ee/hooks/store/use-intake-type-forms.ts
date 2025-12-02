import { useContext } from "react";
import { StoreContext } from "@/lib/store-context";
import type { IIntakeTypeFormStore } from "@/plane-web/store/intake-type-form.store";

export const useIntakeTypeForms = (): IIntakeTypeFormStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useIntakeTypeForms must be used within StoreProvider");
  return context.intakeTypeForms;
};
