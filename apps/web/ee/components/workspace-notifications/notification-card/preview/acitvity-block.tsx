import type { FC, ReactElement, ReactNode } from "react";
import { ArrowRightLeft, CalendarDays, MessageSquare, Paperclip } from "lucide-react";
// plane imports
import {
  ArchiveIcon,
  CustomersIcon,
  CycleIcon,
  EstimatePropertyIcon,
  Intake,
  LabelPropertyIcon,
  MembersPropertyIcon,
  ModuleIcon,
  ParentPropertyIcon,
  PriorityPropertyIcon,
  StatePropertyIcon,
} from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import type { IUserLite } from "@plane/types";
import { Avatar } from "@plane/ui";
import {
  calculateTimeAgo,
  getFileURL,
  getValidKeysFromObject,
  renderFormattedDate,
  renderFormattedTime,
  cn,
} from "@plane/utils";
// hooks
import { usePlatformOS } from "@/hooks/use-platform-os";
// plane web imports
import { useTimeLineRelationOptions } from "@/plane-web/components/relations";
import type { TIssueRelationTypes } from "@/plane-web/types";

type TIssueActivityBlock = {
  createdAt: string | undefined;
  notificationField: string;
  ends: "top" | "bottom" | "single" | undefined;
  children: ReactNode;
  triggeredBy: IUserLite | undefined;
};

export const activityIconMap: Record<string, ReactElement> = {
  state: <StatePropertyIcon width={14} height={14} className="text-secondary" aria-hidden="true" />,
  name: <MessageSquare size={14} className="text-secondary" aria-hidden="true" />,
  description: <MessageSquare size={14} className="text-secondary" aria-hidden="true" />,
  assignees: <MembersPropertyIcon className="h-3.5 w-3.5 flex-shrink-0 text-secondary" />,
  priority: <PriorityPropertyIcon height={14} width={14} className="text-secondary" aria-hidden="true" />,
  estimate_point: <EstimatePropertyIcon height={14} width={14} className="text-secondary" aria-hidden="true" />,
  parent: <ParentPropertyIcon height={14} width={14} className="text-secondary" aria-hidden="true" />,
  start_date: <CalendarDays size={14} className="text-secondary" aria-hidden="true" />,
  target_date: <CalendarDays size={14} className="text-secondary" aria-hidden="true" />,
  cycles: <CycleIcon className="h-4 w-4 flex-shrink-0 text-secondary" />,
  modules: <ModuleIcon className="h-4 w-4 flex-shrink-0 text-secondary" />,
  labels: <LabelPropertyIcon height={14} width={14} className="text-secondary" aria-hidden="true" />,
  link: <MessageSquare size={14} className="text-secondary" aria-hidden="true" />,
  attachment: <Paperclip size={14} className="text-secondary" aria-hidden="true" />,
  archived_at: <ArchiveIcon className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />,
  inbox: <Intake className="h-4 w-4 flex-shrink-0 text-secondary" />,
  type: <ArrowRightLeft className="h-3.5 w-3.5 flex-shrink-0 text-secondary" />,
  customer: <CustomersIcon className="h-3.5 w-3.5 flex-shrink-0 text-secondary" />,
  customer_request: <CustomersIcon className="h-3.5 w-3.5 flex-shrink-0 text-secondary" />,
};

export function IssueActivityBlock(props: TIssueActivityBlock) {
  const { ends, children, createdAt, notificationField, triggeredBy } = props;
  const ISSUE_RELATION_OPTIONS = useTimeLineRelationOptions();
  const activityRelations = getValidKeysFromObject(ISSUE_RELATION_OPTIONS);

  const { isMobile } = usePlatformOS();
  return (
    <div
      className={cn("relative flex w-full gap-3 text-caption-sm-regular", {
        "pb-2": ends === "top",
        "pt-2": ends === "bottom",
        "py-2": ends !== "top" && ends !== "bottom",
      })}
    >
      {ends !== "single" && <div className="absolute left-[13px] top-0 bottom-0 w-px bg-layer-3" aria-hidden />}
      <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden flex justify-center items-center z-[4] bg-layer-3 text-secondary">
        {notificationField === "comment"
          ? triggeredBy && <Avatar src={getFileURL(triggeredBy.avatar_url)} name={triggeredBy.display_name} size={28} />
          : activityRelations.find((field) => field === notificationField)
            ? ISSUE_RELATION_OPTIONS[notificationField as TIssueRelationTypes]?.icon(14)
            : activityIconMap[notificationField]}
      </div>
      <div className="w-full text-secondary flex gap-2">
        <span className="truncate"> {children} </span>
        <span className="text-tertiary">
          {createdAt && (
            <Tooltip
              isMobile={isMobile}
              tooltipContent={`${renderFormattedDate(createdAt)}, ${renderFormattedTime(createdAt)}`}
            >
              <span className="whitespace-nowrap"> {calculateTimeAgo(createdAt)}</span>
            </Tooltip>
          )}
        </span>
      </div>
    </div>
  );
}
