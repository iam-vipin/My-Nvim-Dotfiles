// components
import type { TPowerKCommandConfig } from "@/components/power-k/core/types";
// plane web imports
import type { TPowerKCreationCommandKeysExtended } from "@/plane-web/components/command-palette/power-k/commands/creation";
import { usePowerKCreationCommandsRecordExtended } from "@/plane-web/components/command-palette/power-k/commands/creation";
// local imports
import { usePowerKCreationCommandsRecord } from "./command";
import type { TPowerKCreationCommandKeys } from "./command";

export const usePowerKCreationCommands = (): TPowerKCommandConfig[] => {
  const optionsList: Record<TPowerKCreationCommandKeys, TPowerKCommandConfig> = usePowerKCreationCommandsRecord();
  const optionsListExtended: Record<TPowerKCreationCommandKeysExtended, TPowerKCommandConfig> =
    usePowerKCreationCommandsRecordExtended();

  return [
    optionsList["create_work_item"],
    optionsList["create_page"],
    optionsList["create_view"],
    optionsList["create_cycle"],
    optionsList["create_module"],
    optionsList["create_project"],
    optionsListExtended["create_teamspace"],
    optionsListExtended["create_initiative"],
    optionsListExtended["create_workspace_dashboard"],
    optionsListExtended["create_customer"],
    optionsList["create_workspace"],
  ];
};
