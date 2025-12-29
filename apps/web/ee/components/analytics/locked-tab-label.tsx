import React from "react";
import { LockIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import { cn } from "@plane/utils";

interface LockedTabLabelProps {
  label: React.ReactNode;
  t: (key: string, params?: Record<string, any>) => string;
}

function LockedTabLabel({ label, t }: LockedTabLabelProps) {
  return (
    <Tooltip
      tooltipContent={
        <>
          {t("workspace_analytics.upgrade_to_plan", {
            plan: <span className={cn("text-accent-primary")}>{t("sidebar.pro")}</span>,
            tab: label,
          })}
        </>
      }
    >
      <div className="flex gap-2 justify-center items-center">
        {label} <LockIcon width={10} height={10} />
      </div>
    </Tooltip>
  );
}

export default LockedTabLabel;
