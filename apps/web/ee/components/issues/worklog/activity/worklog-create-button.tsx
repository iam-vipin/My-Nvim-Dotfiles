import type { FC } from "react";
import { useRef } from "react";
import { observer } from "mobx-react";
import { Plus } from "lucide-react";
import { Button } from "@plane/propel/button";
import { Popover } from "@plane/ui";
// helpers
import { cn } from "@plane/utils";
// plane web components
import { useWorkspaceWorklogs } from "@/plane-web/hooks/store";
import { WorklogCreate } from "../create-update";

type TIssueActivityWorklogCreateButton = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  disabled: boolean;
};

export const IssueActivityWorklogCreateButton = observer(function IssueActivityWorklogCreateButton(
  props: TIssueActivityWorklogCreateButton
) {
  const { workspaceSlug, projectId, issueId, disabled } = props;
  // hooks
  const { isWorklogsEnabledByProjectId } = useWorkspaceWorklogs();
  // ref
  const popoverButtonRef = useRef<HTMLButtonElement | null>(null);

  if (!isWorklogsEnabledByProjectId(projectId)) return <></>;
  return (
    <Popover
      popoverButtonRef={popoverButtonRef}
      disabled={disabled}
      buttonClassName={cn("w-full outline-none", { "cursor-not-allowed": disabled })}
      button={
        <Button variant="tertiary" prependIcon={<Plus />} className="border-0">
          Log work
        </Button>
      }
      popperPosition="bottom-end"
      panelClassName="w-72 my-1 rounded-sm border-[0.5px] border-subtle-1 bg-surface-1 p-3 text-11 shadow-raised-200 focus:outline-none"
    >
      <WorklogCreate
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        issueId={issueId}
        handleClose={() => popoverButtonRef.current?.click()}
      />
    </Popover>
  );
});
