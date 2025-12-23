import { observer } from "mobx-react";
import { useParams } from "react-router";
// plane imports
import { StateGroupIcon } from "@plane/propel/icons";
import type { TIssue, TStateGroups } from "@plane/types";
// plane web imports
import { IssueTypeLogo } from "@/plane-web/components/issue-types/common/issue-type-logo";
import { useIssueType, useIssueTypes } from "@/plane-web/hooks/store";

type Props = {
  className?: string;
  projectId?: TIssue["project_id"];
  showOnlyWorkItemType?: boolean;
  stateColor?: string;
  stateGroup?: TStateGroups;
  workItemTypeId?: TIssue["type_id"];
};

export const EditorWorkItemMentionLogo = observer(function EditorWorkItemMentionLogo(props: Props) {
  const { className, projectId, showOnlyWorkItemType = false, stateColor, stateGroup, workItemTypeId } = props;
  // params
  const { workspaceSlug } = useParams();
  // store hooks
  const { isWorkItemTypeEnabledForProject } = useIssueTypes();
  const workItemType = useIssueType(workItemTypeId);
  // derived values
  const isWorkItemTypeEnabled = isWorkItemTypeEnabledForProject(workspaceSlug ?? "", projectId ?? "");

  if (showOnlyWorkItemType && !isWorkItemTypeEnabled) return null;

  return (
    <>
      {isWorkItemTypeEnabled ? (
        <IssueTypeLogo
          icon_props={workItemType?.logo_props?.icon}
          size="xs"
          isDefault={workItemType?.is_default}
          containerClassName={className}
        />
      ) : (
        <StateGroupIcon stateGroup={stateGroup ?? "backlog"} color={stateColor} className={className} />
      )}
    </>
  );
});
