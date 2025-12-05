import type { ReactNode } from "react";
import { isEmpty } from "lodash-es";
import { observer } from "mobx-react";
import { usePathname } from "next/navigation";
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
const BaseWithPreviewHOC = observer((props: IPreviewHOC) => {
  const { children, artifactId, shouldToggleSidebar = true, showEdited = true } = props;
  // router
  const pathname = usePathname();
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
  const isFullScreen = pathname.split("/").includes("pi-chat");
  return (
    <button
      className={cn(
        "group w-full flex flex-col gap-2 p-3 rounded-xl bg-custom-background-100 border border-custom-border-200/50 overflow-hidden hover:shadow-sm animate-fade-in transition-all duration-300",
        {
          "border-custom-primary-100": artifactId === artifactIdInUse,
        }
      )}
      disabled={!shouldToggleSidebar || !isFullScreen}
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
            className={cn(
              "absolute right-3 top-3 text-custom-text-350 flex items-center gap-1 bg-custom-background-100 ",
              "opacity-0 group-hover:opacity-100 transition-all duration-300"
            )}
          >
            <Pencil className="size-3" />
            <div className="text-xs">{!isEmpty(updatedArtifact) ? "Edited" : "Edit"}</div>
          </div>
        )}
    </button>
  );
});

const PreviewProperties = (props: { children: React.ReactNode }) => {
  const { children } = props;
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 items-center [&>*]:p-0 [&>*]:hover:bg-transparent text-sm text-custom-text-300",
        "[&>*:not(:last-child)]:after:content-['']",
        "[&>*:not(:last-child)]:after:inline-block",
        "[&>*:not(:last-child)]:after:w-1 [&>*:not(:last-child)]:after:h-1",
        "[&>*:not(:last-child)]:after:bg-custom-background-80",
        "[&>*:not(:last-child)]:after:rounded-full",
        "[&>*:not(:last-child)]:after:mx-1",
        "[&>*:not(:last-child)]:after:align-middle",
        "[&>*:not(:last-child)]:after:flex-shrink-0"
      )}
    >
      {children}
    </div>
  );
};

// 👇 Extend type manually here
interface WithPreviewHOCType extends React.FC<IPreviewHOC> {
  PreviewProperties: typeof PreviewProperties;
}

const WithPreviewHOC = BaseWithPreviewHOC as WithPreviewHOCType;
WithPreviewHOC.PreviewProperties = PreviewProperties;

export { WithPreviewHOC };
