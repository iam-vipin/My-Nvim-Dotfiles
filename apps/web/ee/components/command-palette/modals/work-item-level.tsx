import { observer } from "mobx-react";
// ce components
import type { TWorkItemLevelModalsProps } from "@/ce/components/command-palette/modals/work-item-level";
import { WorkItemLevelModals as BaseWorkItemLevelModals } from "@/ce/components/command-palette/modals/work-item-level";

export const WorkItemLevelModals = observer(function WorkItemLevelModals(props: TWorkItemLevelModalsProps) {
  return (
    <>
      <BaseWorkItemLevelModals {...props} />
    </>
  );
});
