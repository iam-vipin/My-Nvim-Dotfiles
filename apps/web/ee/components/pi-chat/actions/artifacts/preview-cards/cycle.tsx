import { observer } from "mobx-react";
import { CycleIcon } from "@plane/propel/icons";
import { cn } from "@plane/utils";
import { DisplayDates } from "@/components/properties/dates";
import { useCycleData } from "../useArtifactData";
import { WithPreviewHOC } from "./with-preview-hoc";

type TProps = {
  artifactId: string;
};

export const CyclePreviewCard = observer(function CyclePreviewCard(props: TProps) {
  const { artifactId } = props;
  const data = useCycleData(artifactId);
  if (!data) return <></>;
  return (
    <WithPreviewHOC artifactId={artifactId}>
      <div className="flex gap-2 items-start">
        <CycleIcon className="size-4 text-custom-text-100 my-0.5" />
        <div className="flex flex-col gap-2">
          <div className="truncate text-sm font-medium text-start capitalize">{data?.name || "Unknown"}</div>
          {/* properties */}
          {(data.start_date || data.end_date) && (
            <div
              className={cn(
                "flex flex-wrap gap-2 items-center [&>*]:p-0 [&>*]:hover:bg-transparent text-sm text-custom-text-300"
              )}
            >
              <DisplayDates startDate={data.start_date ?? null} endDate={data.end_date ?? null} />
            </div>
          )}
        </div>
      </div>
    </WithPreviewHOC>
  );
});
