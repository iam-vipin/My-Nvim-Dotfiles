import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import type { TIssue } from "@plane/types";
import { Card, cn } from "@plane/ui";
import { IssueModalProvider } from "@/ce/components/issues/issue-modal";
import { IssueFormRoot } from "@/components/issues/issue-modal/form";
import type { TArtifact, TUpdatedArtifact } from "@/plane-web/types";
import { useWorkItemData } from "../useArtifactData";
import { PiChatArtifactsFooter } from "./footer";

interface TWorkItemDetailProps {
  data: TArtifact;
  updateArtifact: (data: TUpdatedArtifact) => Promise<void>;
  workspaceSlug: string;
  activeChatId: string;
}

export const WorkItemDetail = observer(function WorkItemDetail(props: TWorkItemDetailProps) {
  // props
  const { data, updateArtifact, workspaceSlug, activeChatId } = props;
  // state
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // hooks
  const updatedData = useWorkItemData(data.artifact_id);
  const issueTitleRef = useRef<HTMLInputElement>(null);
  // derived values
  const projectId = data.parameters?.project?.id;

  const handleOnSave = () => {
    setIsSaving(false);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      setError(null);
    }, 1000);
  };

  const handleOnChange = async (formData: Partial<TIssue> | null) => {
    if (!formData) return;
    setIsSaving(true);
    await updateArtifact(formData)
      .then(() => {
        handleOnSave();
      })
      .catch((error) => {
        console.error(error);
        setError(error);
        handleOnSave();
      });
  };
  const commonIssueModalProps = {
    issueTitleRef: issueTitleRef,
    data: updatedData,
    onChange: handleOnChange,
    onAssetUpload: () => {},
    onClose: () => {},
    onSubmit: () => Promise.resolve(),
    projectId: projectId?.toString() || "",
    isCreateMoreToggleEnabled: false,
    onCreateMoreToggleChange: () => {},
    isDraft: false,
    moveToIssue: false,
    modalTitle: "Work item",
    isDuplicateModalOpen: false,
    handleDuplicateIssueModal: () => {},
    isProjectSelectionDisabled: false,
    convertToWorkItem: false,
    showActionButtons: false,
  };

  return (
    <>
      {projectId && (
        <Card className="relative max-w-[700px] rounded-xl shadow-overlay-200 p-0 space-y-0 border border-subtle overflow-hidden">
          <IssueModalProvider>
            <IssueFormRoot {...commonIssueModalProps} key={data.artifact_id} />
          </IssueModalProvider>
          <div
            className={cn("absolute top-0 right-0 w-full h-full bg-surface-1 rounded-xl opacity-50", {
              hidden: data.is_editable,
            })}
          />
        </Card>
      )}
      <PiChatArtifactsFooter
        artifactsData={data}
        workspaceSlug={workspaceSlug}
        activeChatId={activeChatId}
        artifactId={data.artifact_id}
        isSaving={isSaving}
        showSavedToast={showSavedToast}
        error={error}
      />
    </>
  );
});
