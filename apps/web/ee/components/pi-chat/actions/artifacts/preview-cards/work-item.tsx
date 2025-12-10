import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { EpicIcon, LayersIcon } from "@plane/propel/icons";
// components
import { cn, stripAndTruncateHTML } from "@plane/utils";
import { ReadonlyLabels } from "@/components/readonly";
import { ReadonlyCycle } from "@/components/readonly/cycle";
import { ReadonlyDate } from "@/components/readonly/date";
import { ReadonlyEstimate } from "@/components/readonly/estimate";
import { ReadonlyMember } from "@/components/readonly/member";
import { ReadonlyModule } from "@/components/readonly/module";
import { ReadonlyPriority } from "@/components/readonly/priority";
import { ReadonlyState } from "@/components/readonly/state";
import { useWorkItemData } from "../useArtifactData";
import { WithPreviewHOC } from "./with-preview-hoc";
type TProps = {
  artifactId: string;
  isEpic?: boolean;
};

export const WorkItemPreviewCard = observer(function WorkItemPreviewCard(props: TProps) {
  const { artifactId, isEpic = false } = props;
  const data = useWorkItemData(artifactId);
  const { workspaceSlug } = useParams();
  return (
    <WithPreviewHOC artifactId={artifactId}>
      <div className="flex flex-col gap-2 items-start">
        {/* header */}
        <div className="flex gap-2 items-center overflow-hidden w-full">
          {/* issue type icon */}
          {isEpic ? (
            <EpicIcon className="size-4 rounded text-custom-text-200 flex-shrink-0" />
          ) : (
            <LayersIcon className="size-4 rounded flex-shrink-0" />
          )}
          {/* title */}
          <div className="truncate text-sm font-medium text-start">{data.name}</div>
        </div>
        {/* properties */}
        <WithPreviewHOC.PreviewProperties>
          {data.state_id && workspaceSlug && (
            <ReadonlyState
              value={data.state_id}
              projectId={data.project_id ?? undefined}
              workspaceSlug={workspaceSlug?.toString()}
            />
          )}
          {data.priority && <ReadonlyPriority value={data.priority} />}
          {data.assignee_ids && data.assignee_ids?.length > 0 && (
            <ReadonlyMember
              projectId={data.project_id ?? undefined}
              value={data.assignee_ids ?? []}
              placeholder="Assignees"
              multiple
            />
          )}
          {data.label_ids && data.label_ids?.length > 0 && (
            <ReadonlyLabels
              value={data.label_ids ?? []}
              projectId={data.project_id ?? undefined}
              workspaceSlug={workspaceSlug?.toString()}
            />
          )}
          {data.start_date && <ReadonlyDate value={data.start_date ?? null} placeholder="Start date" />}
          {data.target_date && <ReadonlyDate value={data.target_date ?? null} placeholder="Due date" />}
          {data.cycle_id && (
            <ReadonlyCycle
              projectId={data.project_id ?? undefined}
              value={data.cycle_id ?? null}
              placeholder="Cycle"
              workspaceSlug={workspaceSlug?.toString()}
            />
          )}
          {data.module_ids && data.module_ids?.length > 0 && (
            <ReadonlyModule
              projectId={data.project_id ?? undefined}
              value={data.module_ids ?? []}
              placeholder="Modules"
              multiple
              workspaceSlug={workspaceSlug?.toString()}
            />
          )}
          {data.estimate_point && (
            <ReadonlyEstimate
              projectId={data.project_id ?? undefined}
              value={data.estimate_point ?? null}
              placeholder="Estimate"
              workspaceSlug={workspaceSlug?.toString()}
            />
          )}
        </WithPreviewHOC.PreviewProperties>
      </div>
    </WithPreviewHOC>
  );
});
