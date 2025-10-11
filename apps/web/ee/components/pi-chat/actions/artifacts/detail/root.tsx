import { useState } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink, Info } from "lucide-react";
import { getButtonStyling } from "@plane/propel/button";
import { Card } from "@plane/ui";
import { cn } from "@plane/utils";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import { EDITABLE_ARTIFACT_TYPES, TArtifact, TUpdatedArtifact } from "@/plane-web/types";
import { FollowUpDetail } from "./follow-up";
import { Header } from "./header";
import { TemplateDetail } from "./template";
import { Toast } from "./toast";
import { WorkItemDetail } from "./work-item";

const DetailCardRenderer = (props: {
  data: TArtifact;
  workspaceSlug: string;
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
  handleSuccess: () => void;
  handleError: (error: string) => void;
  updateArtifact: (data: Partial<TUpdatedArtifact>) => Promise<void>;
}) => {
  const { data } = props;
  switch (data.artifact_type) {
    case "workitem":
      return <WorkItemDetail {...props} />;
    default:
      return <TemplateDetail {...props} />;
  }
};

export const PiChatArtifactsRoot = observer(() => {
  // states
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // params
  const { workspaceSlug } = useParams();
  // hooks
  const {
    activeChatId,
    isPiArtifactsDrawerOpen: artifactId,
    artifactsStore: { getArtifact, updateArtifact },
  } = usePiChat();
  const { getWorkspaceBySlug } = useWorkspace();
  // derived values
  const artifactsData = artifactId && getArtifact(artifactId);
  const workspaceId = getWorkspaceBySlug(workspaceSlug as string)?.id;
  if (!artifactsData) return null;

  const handleOnSave = () => {
    setIsSaving(false);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      setError(null);
    }, 1000);
  };
  const projectId = artifactsData?.parameters?.project?.id;

  return (
    <div
      className={cn(
        "transform transition-all duration-300 ease-in-out overflow-x-hidden bg-custom-background-90",
        "rounded-lg border border-custom-border-200 h-full max-w-[900px]",
        artifactId
          ? "translate-x-0 absolute top-0 right-0 w-auto lg:relative lg:w-[900px]  mr-2 z-30"
          : "px-0 translate-x-[100%] w-0 border-none"
      )}
    >
      <div className={cn("flex flex-col h-full rounded-lg bg-custom-background-90")}>
        {/* Header */}
        <Header artifact={artifactsData} />
        <div className="flex-1 flex justify-center items-center px-4">
          <Card className="relative max-w-[700px] rounded-xl shadow-lg p-0 space-y-0">
            <DetailCardRenderer
              workspaceSlug={workspaceSlug?.toString() || ""}
              data={artifactsData}
              isSaving={isSaving}
              setIsSaving={setIsSaving}
              handleSuccess={handleOnSave}
              handleError={(error: string) => {
                setError(error);
                handleOnSave();
              }}
              updateArtifact={async (data: Partial<TUpdatedArtifact>) => {
                await updateArtifact(artifactId, "updated", data);
              }}
            />
            <div
              className={cn("absolute top-0 right-0 w-full h-full bg-custom-background-100 rounded-xl opacity-50", {
                "opacity-0": artifactsData.is_executed && artifactsData.success,
                hidden: artifactsData.is_editable,
              })}
            />
          </Card>
        </div>
        {artifactsData.is_executed ? (
          <div className="flex justify-center bg-custom-background-100 w-full">
            {artifactsData.success ? (
              <div className="flex w-full md:w-[700px] justify-between items-center p-4">
                <div className="flex flex-col items-start gap-2">
                  <div className="text-base font-medium">
                    This {artifactsData.artifact_type} has already been {artifactsData.action}d
                  </div>
                  <div className="text-sm text-custom-text-300">You are viewing the preview version</div>
                </div>
                {artifactsData.entity_url && (
                  <Link
                    target="_blank"
                    className={cn("flex items-center gap-2 text-sm font-medium", getButtonStyling("primary", "md"))}
                    href={artifactsData.entity_url}
                  >
                    <ExternalLink className="size-3" />
                    <div>Open {artifactsData.artifact_type}</div>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex justify-center bg-custom-background-100 w-full">
                <div className="flex w-full justify-center items-center p-4">
                  <div className="flex flex-col items-start gap-2">
                    <div className="text-base font-medium">Action could not be executed. Please try again.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : EDITABLE_ARTIFACT_TYPES.includes(artifactsData.artifact_type) && artifactsData.is_editable ? (
          <div className="my-6 mx-auto flex flex-col gap-4 items-center justify-center">
            <div
              className={cn(
                "opacity-0 rounded-xl shadow-sm border-[0.5px] border-custom-border-200 bg-custom-background-100 text-base py-2 px-3 text-custom-text-200 transition-opacity duration-300 ease-in-out",
                { "opacity-100": isSaving || showSavedToast }
              )}
            >
              <Toast error={error} isSaving={isSaving} />
            </div>
            {workspaceId && workspaceSlug && projectId && (
              <FollowUpDetail
                projectId={projectId}
                workspaceId={workspaceId}
                workspaceSlug={workspaceSlug?.toString()}
                activeChatId={activeChatId}
                artifactId={artifactId}
                messageId={artifactsData.message_id}
                artifactType={artifactsData.artifact_type}
              />
            )}
          </div>
        ) : (
          EDITABLE_ARTIFACT_TYPES.includes(artifactsData.artifact_type) && (
            <div className="flex justify-center bg-custom-background-100 w-full">
              <div className="flex w-full justify-center items-center p-4">
                <div className="flex justify-center items-start gap-2 text-custom-text-200">
                  <Info className="size-4 my-auto" />
                  <div className="text-base font-medium">This artifact is no longer editable.</div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
});
