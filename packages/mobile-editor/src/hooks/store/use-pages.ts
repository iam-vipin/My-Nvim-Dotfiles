import { useContext } from "react";
// mobx store
import { StoreContext } from "@/lib/store-context";
// types
import { IPageStore } from "@/store/page.store";

export const usePages = (): IPageStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("usePages must be used within StoreProvider");
  return context.page;
};
