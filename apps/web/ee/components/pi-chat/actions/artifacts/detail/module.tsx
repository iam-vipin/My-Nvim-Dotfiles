import { observer } from "mobx-react";
import type { IModule } from "@plane/types";
import { Card } from "@plane/ui";
import { cn } from "@plane/utils";
import { ModuleForm } from "@/components/modules";
import { usePlatformOS } from "@/hooks/use-platform-os";
import type { TUpdatedArtifact, TArtifact } from "@/plane-web/types";
import { useModuleData } from "../useArtifactData";

interface TModuleDetailProps {
  data: TArtifact;
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
  handleSuccess: () => void;
  handleError: (error: string) => void;
  updateArtifact: (data: TUpdatedArtifact) => Promise<void>;
}

export const ModuleDetail = observer((props: TModuleDetailProps) => {
  const { data, setIsSaving, handleSuccess, handleError, updateArtifact } = props;
  // hooks
  const { isMobile } = usePlatformOS();
  const updatedData = useModuleData(data.artifact_id);
  // derived values
  const projectId = data.parameters?.project?.id;
  // handlers
  const onChange = (formData: Partial<IModule> | null) => {
    if (!formData) return;
    setIsSaving(true);
    updateArtifact(formData)
      .then(() => {
        handleSuccess();
      })
      .catch((error) => {
        console.error(error);
        handleError(error);
      });
  };
  return (
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
  );
});
