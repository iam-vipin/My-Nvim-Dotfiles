// components
import type { TPowerKCommandConfig, TPowerKContextType, TPowerKPageType } from "@/components/power-k/core/types";
// local imports
import { useWikiAppPowerKPageContextBasedActions } from "./page/commands";

export type ContextBasedActionsProps = {
  activePage: TPowerKPageType | null;
  activeContext: TPowerKContextType | null;
  handleSelection: (data: unknown) => void;
};

export function WikiAppPowerKContextBasedPagesList(_props: ContextBasedActionsProps) {
  return <></>;
}

export const useWikiAppPowerKContextBasedActions = (): TPowerKCommandConfig[] => {
  const pageCommands = useWikiAppPowerKPageContextBasedActions();

  return [...pageCommands];
};
