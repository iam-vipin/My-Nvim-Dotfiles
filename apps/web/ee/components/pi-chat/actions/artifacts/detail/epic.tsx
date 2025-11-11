import { useRef } from "react";
import { observer } from "mobx-react";
import type { TIssue } from "@plane/types";
import { IssueModalProvider } from "@/ce/components/issues/issue-modal";
import { EpicFormRoot } from "@/plane-web/components/epics/epic-modal/form";
import type { TArtifact, TUpdatedArtifact } from "@/plane-web/types";
import { useWorkItemData } from "../useArtifactData";

interface TEpicDetailProps {
  data: TArtifact;
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
  handleSuccess: () => void;
  handleError: (error: string) => void;
  updateArtifact: (data: TUpdatedArtifact) => Promise<void>;
}

export const EpicDetail = observer((props: TEpicDetailProps) => {
  const { data, setIsSaving, handleSuccess, handleError, updateArtifact } = props;
  const updatedData = useWorkItemData(data.artifact_id);
  const issueTitleRef = useRef<HTMLInputElement>(null);
  const projectId = data.parameters?.project?.id;

  const handleOnChange = async (formData: Partial<TIssue> | null) => {
    if (!formData) return;
    setIsSaving(true);
    await updateArtifact(formData)
      .then(() => {
        handleSuccess();
      })
      .catch((error) => {
        console.error(error);
        handleError(error);
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
    modalTitle: "Epic modal",
    isDuplicateModalOpen: false,
    handleDuplicateIssueModal: () => {},
    isProjectSelectionDisabled: false,
    convertToWorkItem: false,
    showActionButtons: false,
    dataResetProperties: [data.artifact_id, updatedData],
  };
  return (
    projectId && (
      <IssueModalProvider>
        <EpicFormRoot {...commonIssueModalProps} />
      </IssueModalProvider>
    )
  );
});
