import { useContext } from "react";
// context
import type { TDesktopAppContext } from "./context";
import { DesktopAppContext } from "./context";

export const useDesktopApp = (): TDesktopAppContext => {
  const context = useContext(DesktopAppContext);
  if (context === undefined) throw new Error("useDesktopApp must be used within DesktopAppProvider");
  return context;
};
