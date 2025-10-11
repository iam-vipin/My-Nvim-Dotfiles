import { observer } from "mobx-react";
import { FileText } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { useTemplateData } from "../useArtifactData";
import { Properties } from "./properties";
import { WithPreviewHOC } from "./with-preview-hoc";

type TProps = {
  artifactId: string;
};

export const PagePreviewCard = observer((props: TProps) => {
  const { artifactId } = props;
  const data = useTemplateData(artifactId);
  const properties = { ...data?.parameters?.properties, project: data?.parameters?.project };
  if (!data) return <></>;
  return (
    <WithPreviewHOC artifactId={data.artifact_id}>
      <div className="flex gap-2 w-full">
        {data.parameters?.logo_props?.in_use ? (
          <Logo logo={data.parameters?.logo_props} size={16} type="lucide" />
        ) : (
          <FileText className="size-4 text-custom-text-100" />
        )}
        <div className="flex flex-col w-full overflow-hidden items-start">
          <div className="text-sm text-custom-text-100 font-medium truncate text-start capitalize">
            {data.parameters?.name || "Unknown"}
          </div>
          {properties && <Properties {...properties} />}
        </div>
      </div>
    </WithPreviewHOC>
  );
});
