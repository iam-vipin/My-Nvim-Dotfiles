import { observer } from "mobx-react";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { ProjectIcon } from "@plane/propel/icons";
import "@/plane-web/types";
import { useTemplateData } from "../useArtifactData";
import { Properties } from "./properties";
import { WithPreviewHOC } from "./with-preview-hoc";

type TProps = {
  artifactId: string;
};

export const ProjectPreviewCard = observer(function ProjectPreviewCard(props: TProps) {
  const { artifactId } = props;
  const data = useTemplateData(artifactId);
  const properties = { ...data?.parameters?.properties };
  if (!data) return <></>;
  return (
    <WithPreviewHOC artifactId={data.artifact_id}>
      <div className="flex flex-col items-start">
        {/* header */}
        <div className="flex gap-2 items-center">
          {/*  icon */}
          <div className="flex h-8  w-8 items-center justify-center rounded-md bg-layer-1">
            <span className="grid h-4 w-4 shrink-0 place-items-center">
              {data.parameters?.logo_props ? (
                <Logo logo={data.parameters?.logo_props} size={16} />
              ) : (
                <span className="grid h-4 w-4 shrink-0 place-items-center">
                  <ProjectIcon className="h-4 w-4" />
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-col gap-1 items-start">
            <span className="text-body-sm-medium text-primary truncate text-start capitalize">
              {data.parameters?.name || data.parameters?.project?.name || "Unknown"}
            </span>
            <span className="text-caption-sm-regular text-tertiary truncate">
              {data.project_identifier || data.parameters?.project?.identifier}
            </span>
          </div>
        </div>

        {/* properties */}
        {properties && <Properties {...properties} />}
      </div>
    </WithPreviewHOC>
  );
});
