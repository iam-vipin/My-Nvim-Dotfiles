import { useRef } from "react";
import { observer } from "mobx-react";
import { TIssue } from "@plane/types";
import { IssueModalProvider } from "@/ce/components/issues/issue-modal";
import { IssueFormRoot } from "@/components/issues/issue-modal/form";
import { TArtifact, TUpdatedArtifact } from "@/plane-web/types";
import { useWorkItemData } from "../useArtifactData";

interface TWorkItemDetailProps {
  data: TArtifact;
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
  handleSuccess: () => void;
  handleError: (error: string) => void;
  updateArtifact: (data: TUpdatedArtifact) => Promise<void>;
}

export const WorkItemDetail = observer((props: TWorkItemDetailProps) => {
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
    modalTitle: "Work item modal",
    primaryButtonText: {
      default: "Work item modal",
      loading: "Work item modal",
    },
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
        <IssueFormRoot {...commonIssueModalProps} />
      </IssueModalProvider>
    )
  );
});
