import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { Loader as Spinner } from "lucide-react";
// plane imports
import { ETemplateLevel, EUserPermissionsLevel } from "@plane/constants";
import { ChevronRightIcon } from "@plane/propel/icons";
import { EUserWorkspaceRoles } from "@plane/types";
import { cn } from "@plane/utils";
// ce imports
import type { TWorkItemTemplateSelect } from "@/ce/components/issues/issue-modal/template-select";
// hooks
import { useIssueModal } from "@/hooks/context/use-issue-modal";
import { useUserPermissions } from "@/hooks/store/user";
// plane web imports
import { WorkItemTemplateDropdown } from "@/plane-web/components/templates/dropdowns";
import { useFlag } from "@/plane-web/hooks/store";

export const WorkItemTemplateSelect = observer(function WorkItemTemplateSelect(props: TWorkItemTemplateSelect) {
  const {
    projectId,
    typeId,
    disabled = false,
    size = "sm",
    placeholder,
    renderChevron = false,
    dropDownContainerClassName,
    handleModalClose,
    handleFormChange,
  } = props;
  // router
  const { workspaceSlug } = useParams();
  // store hooks
  const { allowPermissions } = useUserPermissions();
  // issue modal context
  const { workItemTemplateId, isApplyingTemplate, setWorkItemTemplateId } = useIssueModal();
  // derived values
  const isTemplatesEnabled = useFlag(workspaceSlug?.toString(), "WORKITEM_TEMPLATES");
  const hasWorkspaceAdminPermission = allowPermissions(
    [EUserWorkspaceRoles.ADMIN],
    EUserPermissionsLevel.WORKSPACE,
    workspaceSlug?.toString()
  );
  const hasProjectAdminPermission = projectId
    ? allowPermissions([EUserWorkspaceRoles.ADMIN], EUserPermissionsLevel.PROJECT, workspaceSlug?.toString(), projectId)
    : false;

  return (
    <>
      {isTemplatesEnabled && (
        <>
          {renderChevron && (
            <div className="flex items-center gap-2">
              <ChevronRightIcon className="h-3.5 w-3.5 flex-shrink-0 text-tertiary" aria-hidden="true" />
            </div>
          )}
          <div className={cn("h-7", dropDownContainerClassName)}>
            {projectId && (
              <WorkItemTemplateDropdown
                workspaceSlug={workspaceSlug?.toString()}
                templateId={workItemTemplateId}
                projectId={projectId}
                typeId={typeId}
                disabled={disabled}
                size={size}
                placeholder={placeholder}
                customLabelContent={isApplyingTemplate && <Spinner className="size-4 animate-spin" />}
                handleTemplateChange={(templateId) => {
                  setWorkItemTemplateId(templateId);
                  handleFormChange?.();
                }}
                handleRedirection={handleModalClose}
                showCreateNewTemplate={hasWorkspaceAdminPermission || hasProjectAdminPermission}
                level={hasWorkspaceAdminPermission ? ETemplateLevel.WORKSPACE : ETemplateLevel.PROJECT}
              />
            )}
          </div>
        </>
      )}
    </>
  );
});
