import { ReactNode } from "react";
import { isEmpty } from "lodash-es";
import { observer } from "mobx-react";
import { Pencil } from "lucide-react";
import { cn } from "@plane/utils";
import { useAppTheme } from "@/hooks/store/use-app-theme";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import { EDITABLE_ARTIFACT_TYPES } from "@/plane-web/types";

interface IPreviewHOC {
  children: ReactNode;
  artifactId: string;
  shouldToggleSidebar?: boolean;
  showEdited?: boolean;
}

export const WithPreviewHOC = observer((props: IPreviewHOC) => {
  const { children, artifactId, shouldToggleSidebar = true, showEdited = true } = props;
  // store hooks
  const {
    togglePiArtifactsDrawer,
    isPiArtifactsDrawerOpen: artifactIdInUse,
    artifactsStore: { getArtifactByVersion, getArtifact },
  } = usePiChat();
  const { toggleSidebar } = useAppTheme();
  // derived
  const updatedArtifact = getArtifactByVersion(artifactId, "updated");
  const originalArtifact = getArtifact(artifactId);
  return (
    <button
      className={cn(
        "group w-full flex flex-col gap-2 p-3 rounded-xl bg-custom-background-100 border border-custom-border-200/50 overflow-hidden hover:shadow-sm animate-fade-in transition-all duration-300",
        {
          "border-custom-primary-100": artifactId === artifactIdInUse,
        }
      )}
      disabled={!shouldToggleSidebar}
      onClick={() => {
        togglePiArtifactsDrawer(artifactId ?? "");
        toggleSidebar(true);
      }}
    >
      {children}
      {showEdited &&
        originalArtifact?.is_editable &&
        EDITABLE_ARTIFACT_TYPES.includes(originalArtifact.artifact_type) && (
          <div
            className={cn("absolute right-3 top-3 text-custom-text-350 flex items-center gap-1", {
              "opacity-0 group-hover:opacity-100 transition-all duration-300": isEmpty(updatedArtifact),
            })}
          >
            <Pencil className="size-3" />
            <div className="text-xs">{!isEmpty(updatedArtifact) ? "Edited" : "Edit"}</div>
          </div>
        )}
    </button>
  );
});
