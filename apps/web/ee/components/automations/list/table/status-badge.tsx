// plane imports
import { EAutomationRunStatus } from "@plane/types";
import { cn, getAutomationRunStatusLabel } from "@plane/utils";

type TAutomationRunStatusBadgeVariant = "success" | "info" | "error" | "default";

type TAutomationRunStatusBadgeProps = {
  status: EAutomationRunStatus | null;
};

const variantStylesMap: Map<TAutomationRunStatusBadgeVariant, string> = new Map([
  ["success", "bg-success-subtle"],
  ["info", "bg-yellow-500/10"],
  ["error", "bg-danger-subtle"],
  ["default", "bg-layer-1"],
]);

const statusToVariantMap: Map<EAutomationRunStatus, TAutomationRunStatusBadgeVariant> = new Map([
  [EAutomationRunStatus.PENDING, "info"],
  [EAutomationRunStatus.RUNNING, "default"],
  [EAutomationRunStatus.SUCCESS, "success"],
  [EAutomationRunStatus.FAILED, "error"],
  [EAutomationRunStatus.CANCELLED, "error"],
]);

export function AutomationRunStatusBadge(props: TAutomationRunStatusBadgeProps) {
  const { status } = props;
  // derived values
  const styles = status ? variantStylesMap.get(statusToVariantMap.get(status)!) : "text-placeholder";

  return (
    <div className={cn("inline-flex items-center p-1 rounded-sm text-9 text-secondary font-medium", styles)}>
      {status ? getAutomationRunStatusLabel(status) : "--"}
    </div>
  );
}
