import { observer } from "mobx-react";
// ce components
import type { TIssueLevelModalsProps } from "@/ce/components/command-palette/modals/issue-level";
import { IssueLevelModals as BaseIssueLevelModals } from "@/ce/components/command-palette/modals/issue-level";

export const IssueLevelModals = observer((props: TIssueLevelModalsProps) => (
  <>
    <BaseIssueLevelModals {...props} />
  </>
));
