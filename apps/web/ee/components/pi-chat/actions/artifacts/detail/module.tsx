import { useState } from "react";
import { observer } from "mobx-react";
import type { IModule } from "@plane/types";
import { Card } from "@plane/ui";
import { cn } from "@plane/utils";
import { ModuleForm } from "@/components/modules";
import { usePlatformOS } from "@/hooks/use-platform-os";
import type { TUpdatedArtifact, TArtifact } from "@/plane-web/types";
import { useModuleData } from "../useArtifactData";
import { PiChatArtifactsFooter } from "./footer";

interface TModuleDetailProps {
  data: TArtifact;
  updateArtifact: (data: TUpdatedArtifact) => Promise<void>;
  workspaceSlug: string;
  activeChatId: string;
}

export const ModuleDetail = observer(function ModuleDetail(props: TModuleDetailProps) {
  const { data, updateArtifact, workspaceSlug, activeChatId } = props;
  // hooks
  const { isMobile } = usePlatformOS();
  const updatedData = useModuleData(data.artifact_id);
  // state
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // derived values
  const projectId = data.parameters?.project?.id;
  // handlers
  const handleOnSave = () => {
    setIsSaving(false);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      setError(null);
    }, 1000);
  };
  const onChange = (formData: Partial<IModule> | null) => {
    if (!formData) return;
    setIsSaving(true);
    updateArtifact(formData)
      .then(() => {
        handleOnSave();
      })
      .catch((error) => {
        console.error(error);
        setError(error);
        handleOnSave();
      });
  };
  return (
    <>
      <Card className="relative max-w-[700px] rounded-xl shadow-lg p-0 space-y-0">
        <ModuleForm
          onChange={onChange}
          status
          projectId={projectId ?? ""}
          setActiveProject={() => {}}
          data={updatedData}
          isMobile={isMobile}
          showActionButtons={false}
        />
        <div
          className={cn("absolute top-0 right-0 w-full h-full bg-custom-background-100 rounded-xl opacity-50", {
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
