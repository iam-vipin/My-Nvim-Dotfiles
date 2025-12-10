import { observer } from "mobx-react";
import { getIcon } from "../../preview-block";
import { useTemplateData } from "../useArtifactData";
import { Properties } from "./properties";
import { WithPreviewHOC } from "./with-preview-hoc";

type TProps = {
  artifactId: string;
};

export const TemplatePreviewCard = observer(function TemplatePreviewCard(props: TProps) {
  const { artifactId } = props;
  const data = useTemplateData(artifactId);
  if (!data) return <></>;
  const properties = { ...data.parameters?.properties, project: data.parameters?.project };
  return (
    <WithPreviewHOC artifactId={data.artifact_id} shouldToggleSidebar={false} showEdited={false}>
      <div className="flex gap-2 items-start justify-between w-full">
        <div className="flex gap-2 items-start w-full">
          <div className="flex items-center justify-center my-1">
            {getIcon(data.artifact_type, data.parameters?.color?.name || data.parameters?.properties?.color?.name)}
          </div>
          <div className="flex flex-col w-full">
            <div className="flex gap-2 items-center justify-between">
              <div className="truncate text-sm font-medium text-start capitalize">
                {data.parameters?.name || "Unknown"}
              </div>
              <div className="bg-custom-background-90 rounded-full py-0.5 px-2 capitalize text-xs text-custom-text-200 font-medium">
                {data.artifact_type}
              </div>
            </div>
            {data.parameters?.properties && <Properties {...properties} />}
          </div>
        </div>
      </div>
    </WithPreviewHOC>
  );
});
