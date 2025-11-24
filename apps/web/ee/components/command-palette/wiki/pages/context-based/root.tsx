// components
import type { TPowerKCommandConfig, TPowerKContextType, TPowerKPageType } from "@/components/power-k/core/types";
// local imports
import { useWikiAppPowerKPageContextBasedActions } from "./page/commands";

export type ContextBasedActionsProps = {
  activePage: TPowerKPageType | null;
  activeContext: TPowerKContextType | null;
  handleSelection: (data: unknown) => void;
};

export const WikiAppPowerKContextBasedPagesList: React.FC<ContextBasedActionsProps> = (_props) => <></>;

export const useWikiAppPowerKContextBasedActions = (): TPowerKCommandConfig[] => {
  const pageCommands = useWikiAppPowerKPageContextBasedActions();

  return [...pageCommands];
};
