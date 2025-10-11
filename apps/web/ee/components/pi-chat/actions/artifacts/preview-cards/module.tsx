import { observer } from "mobx-react";
import { DiceIcon } from "@plane/propel/icons";
import { useTemplateData } from "../useArtifactData";
import { Properties } from "./properties";
import { WithPreviewHOC } from "./with-preview-hoc";

type TProps = {
  artifactId: string;
};

export const ModulePreviewCard = observer((props: TProps) => {
  const { artifactId } = props;
  const data = useTemplateData(artifactId);
  const properties = { ...data?.parameters?.properties, project: data?.parameters?.project };
  if (!data) return <></>;
  return (
    <WithPreviewHOC artifactId={data.artifact_id}>
      <div className="flex gap-2 items-start">
        <DiceIcon className="size-4 text-custom-text-100 my-0.5" />
        <div className="flex flex-col">
          <div className="truncate text-sm font-medium text-start capitalize">{data.parameters?.name || "Unknown"}</div>
          {properties && <Properties {...properties} />}
        </div>
      </div>
    </WithPreviewHOC>
  );
});
