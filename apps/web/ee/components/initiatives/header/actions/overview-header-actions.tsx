import { observer } from "mobx-react";
import { PanelRight } from "lucide-react";
import { cn } from "@plane/utils";
import { IconButton } from "@plane/propel/icon-button";
// hooks
import { useAppTheme } from "@/hooks/store/use-app-theme";

export const InitiativeOverviewHeaderActions = observer(function InitiativeOverviewHeaderActions() {
  const { initiativesSidebarCollapsed, toggleInitiativesSidebar } = useAppTheme();
  return (
    <IconButton
      variant="tertiary"
      size="lg"
      icon={PanelRight}
      onClick={() => toggleInitiativesSidebar()}
      className={cn({
        "text-accent-primary bg-accent-subtle": !initiativesSidebarCollapsed,
      })}
    />
  );
});
