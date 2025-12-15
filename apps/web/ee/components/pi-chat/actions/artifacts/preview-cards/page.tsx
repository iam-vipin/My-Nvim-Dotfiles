import { observer } from "mobx-react";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { PageIcon } from "@plane/propel/icons";
import { usePageData } from "../useArtifactData";
import { WithPreviewHOC } from "./with-preview-hoc";

type TProps = {
  artifactId: string;
};

export const PagePreviewCard = observer(function PagePreviewCard(props: TProps) {
  const { artifactId } = props;
  const data = usePageData(artifactId);
  if (!data) return <></>;
  return (
    <WithPreviewHOC artifactId={artifactId}>
      <div className="flex gap-2 w-full items-center">
        {data.logo_props?.in_use ? (
          <Logo logo={data.logo_props} size={16} type="lucide" />
        ) : (
          <PageIcon className="size-4 text-primary" />
        )}
        <div className="flex flex-col w-full overflow-hidden items-start">
          <div className="text-body-sm-medium text-primary truncate text-start capitalize">
            {data.name || "Unknown"}
          </div>
        </div>
      </div>
    </WithPreviewHOC>
  );
});
