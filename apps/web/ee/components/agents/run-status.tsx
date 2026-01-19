import { observer } from "mobx-react";
// plane imports
import { EAgentRunStatus } from "@plane/types";
import { cn } from "@plane/utils";

export const AgentRunStatus = observer(function AgentRunStatus(props: { status: EAgentRunStatus }) {
  const { status } = props;
  const getStatusColor = (status: EAgentRunStatus) => {
    switch (status) {
      case EAgentRunStatus.CREATED:
        return "text-label-indigo-text bg-label-indigo-bg";
      case EAgentRunStatus.AWAITING:
        return "text-label-yellow-text bg-label-yellow-bg";
      case EAgentRunStatus.IN_PROGRESS:
        return "text-label-yellow-text bg-label-yellow-bg";
      case EAgentRunStatus.STOPPING:
        return "text-label-orange-text bg-label-orange-bg";
      case EAgentRunStatus.STOPPED:
        return "text-label-grey-text bg-label-grey-bg";
      case EAgentRunStatus.FAILED:
        return "text-label-crimson-text bg-label-crimson-bg";
      case EAgentRunStatus.COMPLETED:
        return "text-label-emerald-text bg-label-emerald-bg";
      case EAgentRunStatus.STALE:
        return "text-label-grey-text bg-label-grey-bg";
    }
  };
  return (
    <span className={cn("capitalize text-caption-sm-regular rounded-sm px-1 py-0.5", getStatusColor(status))}>
      {status.split("_").join(" ")}
    </span>
  );
});
