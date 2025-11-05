import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react";
import type { TIssue } from "@plane/types";
import { IssueModalProvider } from "@/ce/components/issues/issue-modal";
import { IssueFormRoot } from "@/components/issues/issue-modal/form";
import type { TArtifact, TUpdatedArtifact } from "@/plane-web/types";
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
  // props
  const { data, setIsSaving, handleSuccess, handleError, updateArtifact } = props;
  // state
  const [shouldUpdateDescription, setShouldUpdateDescription] = useState(true);
  const [description, setDescription] = useState<string | undefined>(undefined);
  // hooks
  const updatedData = useWorkItemData(data.artifact_id);
  const issueTitleRef = useRef<HTMLInputElement>(null);
  // derived values
  const projectId = data.parameters?.project?.id;

  const handleOnChange = async (formData: Partial<TIssue> | null) => {
    if (!formData) return;
    setIsSaving(true);
    setShouldUpdateDescription(false);
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
    data: { ...updatedData, description_html: description },
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
    dataResetProperties: [data.artifact_id, updatedData],
  };

  useEffect(() => {
    if (shouldUpdateDescription) {
      setDescription(updatedData.description_html);
    } else {
      setShouldUpdateDescription(true);
    }
  }, [updatedData]);

  return (
    projectId && (
      <IssueModalProvider>
        <IssueFormRoot {...commonIssueModalProps} />
      </IssueModalProvider>
    )
  );
});
