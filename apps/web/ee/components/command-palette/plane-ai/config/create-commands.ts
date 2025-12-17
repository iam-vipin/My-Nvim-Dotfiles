import { SquarePlus } from "lucide-react";
// components
import type { TPowerKCommandConfig } from "@/components/power-k/core/types";
// plane web imports
import { getIsWorkspaceCreationDisabled } from "@/plane-web/helpers/instance.helper";

export type TPowerKCreationCommandKeys = "create_work_item" | "create_workspace";

/**
 * Creation commands - Create any entity in the app
 */
export const usePlaneAiAppPowerKCreationCommands = (): TPowerKCommandConfig[] => {
  const isWorkspaceCreationDisabled = getIsWorkspaceCreationDisabled();

  return [
    {
      id: "create_workspace",
      type: "action",
      group: "create",
      i18n_title: "power_k.creation_actions.create_workspace",
      icon: SquarePlus,
      action: (ctx) => ctx.router.push("/create-workspace"),
      isEnabled: () => !isWorkspaceCreationDisabled,
      isVisible: () => !isWorkspaceCreationDisabled,
      closeOnSelect: true,
    },
  ];
};
