import { useState } from "react";
import { Info } from "lucide-react";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { useUserPermissions } from "@/hooks/store/user";
import { revalidateProjectData } from "@/plane-web/helpers/swr.helper";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import type { TDialogue } from "@/plane-web/types";
import { EExecutionStatus } from "@/plane-web/types";
import { ConfirmBlock } from "./confirm-block";
import { SummaryBlock } from "./summary";

type TProps = {
  isLatest: boolean | undefined;
  isPiThinking: boolean | undefined;
  workspaceId: string | undefined;
  workspaceSlug: string | undefined;
  query_id: string | undefined;
  activeChatId: string;
  isPiTyping: boolean;
  dialogue: TDialogue;
};

function ActionStatusBlock(props: TProps) {
  // props

  const { isLatest, isPiThinking, workspaceSlug, workspaceId, query_id, activeChatId, isPiTyping, dialogue } = props;
  const { execution_status, action_summary, actions, action_error } = dialogue;
  // states
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  // store
  const { getProjectRoleByWorkspaceSlugAndProjectId } = useUserPermissions();
  const { getChatFocus, executeAction } = usePiChat();

  const chatFocus = getChatFocus(activeChatId);
  // handlers
  const handleExecuteAction = async (workspaceId: string, query_id: string) => {
    try {
      setIsExecutingAction(true);
      const actionableEntities = await executeAction(workspaceId, activeChatId, query_id);
      if (actionableEntities && actionableEntities.length > 0 && workspaceSlug) {
        const projectId = chatFocus?.entityType === "project_id" ? chatFocus?.entityIdentifier : undefined;
        const currentProjectRole = projectId
          ? getProjectRoleByWorkspaceSlugAndProjectId(workspaceSlug, projectId)
          : undefined;
        revalidateProjectData(workspaceSlug, actionableEntities, projectId, currentProjectRole);
      }
    } catch (e: any) {
      console.error(e);
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Action failed!",
        message: e?.error ?? e?.detail ?? e?.message ?? "Unable to execute action.",
      });
    } finally {
      setIsExecutingAction(false);
    }
  };
  if (actions?.length === 0 || !query_id) return null;
  if (execution_status === EExecutionStatus.PENDING) {
    if (isPiThinking || (isLatest && isPiTyping)) return null;
    if (isLatest) {
      return (
        <ConfirmBlock
          summary="Please confirm the actions you want to execute"
          isExecutingAction={isExecutingAction}
          handleExecuteAction={handleExecuteAction}
          workspaceId={workspaceId}
          query_id={query_id}
        />
      );
    } else
      return (
        <div className="flex gap-2 text-placeholder text-13 mb-4">
          <Info size={16} className="my-auto" />
          <div> {actions?.length} action(s) not executed </div>
        </div>
      );
  }
  if (action_summary && action_summary?.completed + action_summary?.failed !== actions?.length)
    return (
      <div className="flex gap-2 text-placeholder text-body-sm-regular mb-4">
        <Info size={16} className="my-auto text-icon-tertiary" />
        <div> {actions?.length} action(s) not executed </div>
      </div>
    );
  // Render summary if execution status is executing or action summary is present
  const shouldShowSummary = execution_status === EExecutionStatus.EXECUTING || Boolean(action_summary);

  if (!shouldShowSummary && !action_error) return null;

  return (
    <div className="flex flex-col gap-2">
      {action_error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-13 text-red-600">{action_error}</div>
      )}
      {shouldShowSummary && (
        <SummaryBlock
          summary={dialogue.action_summary}
          chatId={activeChatId}
          status={execution_status}
          query_id={query_id}
        />
      )}
    </div>
  );
}

export default ActionStatusBlock;
