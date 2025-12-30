import { observer } from "mobx-react";
// plane imports
import { cn } from "@plane/utils";
// plane web imports
import { useAutomations } from "@/plane-web/hooks/store/automations/use-automations";
// local imports
import { AutomationDetailsSidebarContent } from "./content";

type Props = {
  automationId: string;
};

export const AutomationDetailsSidebarRoot = observer(function AutomationDetailsSidebarRoot(props: Props) {
  const { automationId } = props;
  // store hooks
  const { getAutomationById } = useAutomations();
  // derived values
  const { sidebarHelper } = getAutomationById(automationId) ?? {};
  const selectedSidebarTab = sidebarHelper?.selectedSidebarConfig?.tab;

  return (
    <aside
      className={cn(
        "flex-shrink-0 h-full w-[400px] -mr-[400px] flex flex-col bg-surface-1 border-l border-subtle-1 space-y-6 overflow-y-scroll vertical-scrollbar scrollbar-sm transition-all",
        {
          "mr-0": !!selectedSidebarTab,
        }
      )}
    >
      <AutomationDetailsSidebarContent automationId={automationId} />
    </aside>
  );
});
