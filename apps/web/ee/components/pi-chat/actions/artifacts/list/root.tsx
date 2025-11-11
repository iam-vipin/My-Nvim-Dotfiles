import type { TArtifact } from "@/plane-web/types";
import { PreviewCard } from "../preview-cards/root";

export const PiChatArtifactsListRoot = (props: { artifacts: TArtifact[] }) => {
  const { artifacts } = props;
  return (
    <div className="flex flex-col gap-4">
      {artifacts.map((artifact) => (
        <PreviewCard
          key={artifact.artifact_id}
          artifactId={artifact.artifact_id}
          type={artifact.artifact_type}
          action={artifact.action}
        />
      ))}
    </div>
  );
};
