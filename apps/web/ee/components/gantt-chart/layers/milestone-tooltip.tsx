import type { FC } from "react";
import { CircularProgressIndicator, cn } from "@plane/ui";
import { WorkItemsIcon } from "@plane/propel/icons";

type Props = {
  title: string;
  workItemsCount: number;
  progress: number;
  mouseY: number;
};

export const MilestoneTooltip: FC<Props> = function MilestoneTooltip({ title, workItemsCount, progress, mouseY }) {
  return (
    <div
      className="absolute left-2 bg-custom-background-100 border border-custom-border-200 rounded-md shadow-lg px-3 py-2 min-w-[200px]"
      style={{
        top: `${mouseY + 22}px`,
        transform: "translateY(-50%)",
      }}
    >
      <div className="flex flex-col gap-2">
        {/* Title */}
        <p className="text-sm font-medium text-custom-text-100 truncate">{title}</p>

        {/* Progress and work items */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-1.5">
            <CircularProgressIndicator
              size={16}
              percentage={progress}
              strokeWidth={3}
              strokeColor={cn(progress >= 100 ? "stroke-green-400" : "stroke-custom-primary-100")}
            />
            <span className="text-custom-text-200 font-medium">{Math.round(progress)}% Progress</span>
          </div>
          <div className="flex gap-2">
            <WorkItemsIcon className="size-4 text-custom-text-200" />
            <span className="text-custom-text-200 font-medium">
              {workItemsCount} work item{workItemsCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
