import { useState } from "react";
import { observer } from "mobx-react";
import type { TProject } from "@plane/types";
import { Card, cn } from "@plane/ui";
import { CreateProjectForm } from "@/plane-web/components/projects/create/root";
import type { TArtifact, TUpdatedArtifact } from "@/plane-web/types";
import { useProjectData } from "../useArtifactData";
import { PiChatArtifactsFooter } from "./footer";

interface TProjectDetailProps {
  data: TArtifact;
  updateArtifact: (data: TUpdatedArtifact) => Promise<void>;
  workspaceSlug: string;
  activeChatId: string;
}

export const ProjectDetail = observer(function ProjectDetail(props: TProjectDetailProps) {
  // props
  const { data, updateArtifact, workspaceSlug, activeChatId } = props;
  // state
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // hooks
  const updatedData = useProjectData(data.artifact_id);
  // handlers
  const handleOnSave = () => {
    setIsSaving(false);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      setError(null);
    }, 1000);
  };
  const handleOnChange = async (formData: Partial<TProject> | null) => {
    if (!formData) return;
    setIsSaving(true);
    await updateArtifact(formData)
      .then(() => {
        handleOnSave();
      })
      .catch((error) => {
        console.error(error);
        setError(error?.message || String(error));
        handleOnSave();
      });
  };

  return (
    <>
      <Card className="relative max-w-[700px] rounded-xl shadow-lg p-0 space-y-0">
        <CreateProjectForm
          workspaceSlug={workspaceSlug}
          onClose={() => {}}
          handleNextStep={() => {}}
          data={updatedData}
          templateId={undefined}
          showActionButtons={false}
          onChange={handleOnChange}
          updateCoverImageStatus={() => Promise.resolve()}
          dataResetProperties={[data.artifact_id, updatedData]}
        />
        <div
          className={cn("absolute top-0 right-0 w-full h-full bg-surface-1 rounded-xl opacity-50", {
            hidden: data.is_editable,
          })}
        />
      </Card>
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
