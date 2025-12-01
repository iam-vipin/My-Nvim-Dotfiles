import { useContext } from "react";
// lib
import { StoreContext } from "@/lib/store-provider";
// plane web stores
import type { IPagesListStore } from "@/plane-web/store/pages";

export const usePagesList = (): IPagesListStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("usePagesList must be used within StoreProvider");
  return context.pagesListStore;
};
