import { observer } from "mobx-react";
import { DiceIcon, ModuleStatusIcon, StatePropertyIcon } from "@plane/propel/icons";
import { cn } from "@plane/utils";
import { DisplayDates } from "@/components/properties/dates";
import { ReadonlyMember } from "@/components/readonly/member";
import { useModuleData } from "../useArtifactData";
import { WithPreviewHOC } from "./with-preview-hoc";

type TProps = {
  artifactId: string;
};

export const ModulePreviewCard = observer(function ModulePreviewCard(props: TProps) {
  const { artifactId } = props;
  const data = useModuleData(artifactId);
  if (!data) return <></>;
  return (
    <WithPreviewHOC artifactId={artifactId}>
      <div className="flex gap-2 items-start">
        <DiceIcon className="size-4 text-custom-text-100 my-0.5 flex-shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="truncate text-sm font-medium text-start capitalize">{data.name || "Unknown"}</div>
          {/* properties */}
          <WithPreviewHOC.PreviewProperties>
            <div className={`flex items-center justify-center gap-2 text-sm py-0.5 capitalize`}>
              {data.status ? <ModuleStatusIcon status={data.status} /> : <StatePropertyIcon className={`h-3 w-3 `} />}
              {data.status ?? <span className={`text-custom-text-200`}>Status</span>}
            </div>
            {data.member_ids && data.member_ids?.length > 0 && (
              <ReadonlyMember
                projectId={data.project_id ?? undefined}
                value={data.member_ids ?? []}
                placeholder="Members"
                multiple
              />
            )}
            {data.lead_id && (
              <ReadonlyMember projectId={data.project_id ?? undefined} value={data.lead_id ?? []} placeholder="Lead" />
            )}
            {(data.start_date || data.target_date) && (
              <div
                className={cn(
                  "flex flex-wrap gap-2 items-center [&>*]:p-0 [&>*]:hover:bg-transparent text-sm text-custom-text-300"
                )}
              >
                <DisplayDates startDate={data.start_date ?? null} endDate={data.target_date ?? null} />
              </div>
            )}
          </WithPreviewHOC.PreviewProperties>
        </div>
      </div>
    </WithPreviewHOC>
  );
});
