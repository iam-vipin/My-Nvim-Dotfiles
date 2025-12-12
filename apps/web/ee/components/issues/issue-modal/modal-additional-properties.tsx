import React from "react";
import { observer } from "mobx-react";
import { useFormContext } from "react-hook-form";
// plane imports
import type { TIssue } from "@plane/types";
import { EIssueServiceType, EWorkItemTypeEntity } from "@plane/types";
import { cn } from "@plane/utils";
// hooks
import type { TWorkItemModalAdditionalPropertiesProps } from "@/ce/components/issues/issue-modal/modal-additional-properties";
import { useIssueModal } from "@/hooks/context/use-issue-modal";
// local imports
import { IssueAdditionalProperties } from "./additional-properties";
import { TemplateSubWorkitemsList } from "./template-sub-workitems-list";

/**
 * This component contains all the additional properties for the work item modal.
 * Includes custom properties and sub work item list for template creation.
 * This requires issue modal context to be available in the parent component.
 */
export const WorkItemModalAdditionalProperties = observer(function WorkItemModalAdditionalProperties(
  props: TWorkItemModalAdditionalPropertiesProps
) {
  const { isDraft = false, workItemId, projectId, workspaceSlug } = props;
  // form context
  const { watch } = useFormContext<TIssue>();
  // modal context
  const { getActiveAdditionalPropertiesLength } = useIssueModal();
  const activeAdditionalPropertiesLength = getActiveAdditionalPropertiesLength({
    projectId: projectId,
    workspaceSlug: workspaceSlug,
    watch: watch,
  });

  return (
    <div
      className={cn(
        "px-5",
        activeAdditionalPropertiesLength <= 4 &&
          "max-h-[25vh] overflow-hidden overflow-y-auto vertical-scrollbar scrollbar-sm"
      )}
    >
      {projectId && (
        <IssueAdditionalProperties
          entityType={EWorkItemTypeEntity.WORK_ITEM}
          isDraft={isDraft}
          issueId={workItemId}
          issueServiceType={EIssueServiceType.ISSUES}
          issueTypeId={watch("type_id")}
          projectId={projectId}
          workspaceSlug={workspaceSlug}
        />
      )}
      <TemplateSubWorkitemsList />
    </div>
  );
});
