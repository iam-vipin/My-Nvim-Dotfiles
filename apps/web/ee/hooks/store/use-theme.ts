import { useContext } from "react";
// context
import { StoreContext } from "@/lib/store-context";
// plane web stores
import type { IThemeStore } from "@/plane-web/store/theme.store";

export const useTheme = (): IThemeStore => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("useTheme must be used within StoreProvider");
  return context.theme;
};
