import { observer } from "mobx-react";
// plane imports
import { cn } from "@plane/utils";
// hooks
import { useIssueDetails } from "@/hooks/store/use-issue-details";
// plane-web
import { IssueGanttSidebarBlock } from "@/plane-web/components/issue-layouts/gantt";
import { findTotalDaysInRange } from "@/plane-web/helpers/date-time.helper";
// constants
import { BLOCK_HEIGHT } from "../../constants";
// hooks
import { useGanttChart } from "../../hooks";
// types
import type { IGanttBlock } from "../../types";

type Props = {
  block: IGanttBlock;
};

export const IssuesSidebarBlock = observer(function IssuesSidebarBlock(props: Props) {
  const { block } = props;
  // store hooks
  const { updateActiveBlockId, isBlockActive } = useGanttChart();
  const { getIsIssuePeeked } = useIssueDetails();

  const duration = findTotalDaysInRange(block.start_date, block.target_date);

  if (!block.data) return null;

  const isBlockHoveredOn = isBlockActive(block.id);

  return (
    <div
      className={cn("group/list-block", {
        "rounded-l border border-r-0 border-accent-strong": getIsIssuePeeked(block.data.id),
      })}
      onMouseEnter={() => updateActiveBlockId(block.id)}
      onMouseLeave={() => updateActiveBlockId(null)}
    >
      <div
        className={cn("group w-full flex items-center gap-2 pl-2 pr-4", {
          "bg-layer-transparent-hover": isBlockHoveredOn,
        })}
        style={{
          height: `${BLOCK_HEIGHT}px`,
        }}
      >
        <div className="flex h-full flex-grow items-center justify-between gap-2 truncate">
          <div className="flex-grow truncate">
            <IssueGanttSidebarBlock issueId={block.data.id} />
          </div>
          {duration && (
            <div className="flex-shrink-0 text-13 text-secondary">
              <span>
                {duration} day{duration > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
