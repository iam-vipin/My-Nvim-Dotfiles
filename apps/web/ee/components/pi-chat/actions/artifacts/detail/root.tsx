import { useState } from "react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink, Info } from "lucide-react";
import { getButtonStyling } from "@plane/propel/button";
import { cn } from "@plane/utils";
import { useWorkspace } from "@/hooks/store/use-workspace";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import type { TArtifact, TUpdatedArtifact } from "@/plane-web/types";
import { EDITABLE_ARTIFACT_TYPES } from "@/plane-web/types";
import { EpicDetail } from "./epic";
import { FollowUpDetail } from "./follow-up";
import { Header } from "./header";
import { ModuleDetail } from "./module";
import { PageDetail } from "./page";
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
    case "page":
      return <PageDetail {...props} />;
    case "epic":
      return <EpicDetail {...props} />;
    case "module":
      return <ModuleDetail {...props} />;
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
        "transform transition-all duration-300 ease-in-out overflow-x-hidden",
        "rounded-lg border border-custom-border-200 h-full max-w-[900px]",
        artifactId
          ? "translate-x-0 absolute top-0 right-0 w-auto lg:relative lg:w-[900px]  mr-2 z-30"
          : "px-0 translate-x-[100%] w-0 border-none"
      )}
    >
      <div
        className={cn("flex flex-col h-full rounded-lg bg-custom-background-90", {
          "bg-custom-background-100": artifactsData.artifact_type === "page",
        })}
      >
        {/* Header */}
        <Header artifact={artifactsData} />
        <div
          className={cn("flex-1 flex justify-center items-center px-4 h-full overflow-y-scroll relative", {
            "bg-custom-background-100 justify-start": artifactsData.artifact_type === "page",
          })}
        >
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
        </div>
        {artifactsData.is_executed ? (
          <div className="flex justify-center bg-custom-background-100 w-full border-t border-custom-border-100">
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
          <div className="my-6 mx-auto flex flex-col gap-4 items-center justify-center absolute bottom-0 left-1/2 right-1/2 -translate-x-1/2 shadow-2xl">
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
