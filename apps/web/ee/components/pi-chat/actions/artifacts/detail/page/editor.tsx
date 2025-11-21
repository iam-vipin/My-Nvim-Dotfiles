import { useMemo } from "react";
import { observer } from "mobx-react";
// plane imports
import type { EditorRefApi } from "@plane/editor";
import type { TSearchEntityRequestPayload } from "@plane/types";
// components
import { DocumentEditor } from "@/components/editor/document/editor";
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
// services
import { WorkspaceService } from "@/plane-web/services";
const workspaceService = new WorkspaceService();

type Props = {
  workspaceSlug: string;
  projectId?: string;
  initialValue: string;
  artifactId: string;
  onChange: (json: object, html: string) => void;
  editorRef: React.RefObject<EditorRefApi>;
};

export const PagePreviewEditor = observer((props: Props) => {
  const { workspaceSlug, projectId, artifactId, initialValue, onChange, editorRef } = props;
  const { getWorkspaceBySlug } = useWorkspace();
  // derived values
  const workspaceId = useMemo(
    () => (workspaceSlug ? (getWorkspaceBySlug(workspaceSlug)?.id ?? "") : ""),
    [getWorkspaceBySlug, workspaceSlug]
  );

  return (
    <DocumentEditor
      disabledExtensions={["issue-embed", "attachments", "image", "drawio", "comments", "page-embed", "nested-pages"]}
      editable
      id={`page-artifact-${artifactId}`}
      value={initialValue}
      onChange={onChange}
      containerClassName="min-h-[120px] border-none pl-4 -ml-4"
      uploadFile={async () => ""}
      duplicateFile={async () => ""}
      searchMentionCallback={async (payload: TSearchEntityRequestPayload) =>
        await workspaceService.searchEntity(workspaceSlug?.toString() ?? "", {
          ...payload,
          project_id: projectId?.toString() ?? "",
        })
      }
      bubbleMenuEnabled
      workspaceId={workspaceId}
      workspaceSlug={workspaceSlug}
      ref={editorRef}
    />
  );
});
