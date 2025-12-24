// components
import { usePowerKAccountCommands } from "@/components/power-k/config/account-commands";
import { usePowerKHelpCommands } from "@/components/power-k/config/help-commands";
import { usePowerKMiscellaneousCommands } from "@/components/power-k/config/miscellaneous-commands";
import { usePowerKPreferencesCommands } from "@/components/power-k/config/preferences-commands";
import type { TPowerKCommandConfig } from "@/components/power-k/core/types";
// local imports
import { usePlaneAiAppPowerKCreationCommands } from "./create-commands";

export const usePlaneAiAppPowerKCommands = (): TPowerKCommandConfig[] => {
  const creationCommands = usePlaneAiAppPowerKCreationCommands();
  const accountCommands = usePowerKAccountCommands();
  const miscellaneousCommands = usePowerKMiscellaneousCommands();
  const preferencesCommands = usePowerKPreferencesCommands();
  const helpCommands = usePowerKHelpCommands();

  return [...creationCommands, ...accountCommands, ...miscellaneousCommands, ...preferencesCommands, ...helpCommands];
};
