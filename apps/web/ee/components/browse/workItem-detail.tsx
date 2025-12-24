import { useRef } from "react";
import { observer } from "mobx-react";
// plane imports
import type { TIssue } from "@plane/types";
import type { EditorRefApi } from "@plane/editor";
// components
import { WorkItemDetailRoot as CEWorkItemDetailRoot } from "@/ce/components/browse/workItem-detail";
// plane web imports
import { EpicDetailRoot } from "@/plane-web/components/epics/details/root";

export type TWorkItemDetailRoot = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  issue: TIssue | undefined;
};

export const WorkItemDetailRoot = observer(function WorkItemDetailRoot(props: TWorkItemDetailRoot) {
  const { workspaceSlug, projectId, issueId, issue } = props;
  // refs
  const editorRef = useRef<EditorRefApi>(null);
  // hooks
  if (issue?.is_epic) {
    return (
      <EpicDetailRoot
        editorRef={editorRef}
        workspaceSlug={workspaceSlug.toString()}
        projectId={projectId.toString()}
        epicId={issueId.toString()}
      />
    );
  }

  return (
    <CEWorkItemDetailRoot
      workspaceSlug={workspaceSlug.toString()}
      projectId={projectId.toString()}
      issueId={issueId.toString()}
      issue={issue}
    />
  );
});
