import { observer } from "mobx-react";
import { PanelRight } from "lucide-react";
import { cn } from "@plane/utils";
// hooks
import { useAppTheme } from "@/hooks/store/use-app-theme";

export const InitiativeOverviewHeaderActions = observer(function InitiativeOverviewHeaderActions() {
  const { initiativesSidebarCollapsed, toggleInitiativesSidebar } = useAppTheme();
  return (
    <button
      type="button"
      className={cn("p-1 rounded outline-none hover:bg-layer-transparent-hover bg-layer-transparent", {
        "bg-layer-transparent-selected": !initiativesSidebarCollapsed,
      })}
      onClick={() => toggleInitiativesSidebar()}
    >
      <PanelRight
        className={cn(
          "size-4 cursor-pointer",
          !initiativesSidebarCollapsed ? "text-icon-primary" : "text-icon-secondary"
        )}
      />
    </button>
  );
});
