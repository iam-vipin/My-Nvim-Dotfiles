import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { EmptyStateDetailed } from "@plane/propel/empty-state";
import { EUserProjectRoles } from "@plane/types";
// hooks
import { useUserPermissions } from "@/hooks/store/user";
// plane web imports
import { CreateUpdateEpicModal } from "@/plane-web/components/epics/epic-modal";
import { useIssueTypes } from "@/plane-web/hooks/store";

export const ProjectEpicsEmptyState: React.FC = observer(() => {
  // router
  const { projectId } = useParams();
  // states
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  // plane hooks
  const { t } = useTranslation();
  // store hooks
  const { allowPermissions } = useUserPermissions();
  const { getProjectEpicId } = useIssueTypes();
  // derived values
  const projectEpicId = getProjectEpicId(projectId?.toString());
  const hasProjectMemberLevelPermissions = allowPermissions(
    [EUserProjectRoles.ADMIN, EUserProjectRoles.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  return (
    <div className="relative h-full w-full overflow-y-auto">
      <CreateUpdateEpicModal
        isOpen={isCreateIssueModalOpen}
        onClose={() => setIsCreateIssueModalOpen(false)}
        data={{
          project_id: projectId.toString(),
          type_id: projectEpicId,
        }}
      />
      <EmptyStateDetailed
        assetKey="epic"
        title={t("project.epics.title")}
        description={t("project.epics.description")}
        actions={[
          {
            label: t("project.epics.cta_primary"),
            onClick: () => setIsCreateIssueModalOpen(true),
            disabled: !hasProjectMemberLevelPermissions,
          },
        ]}
      />
    </div>
  );
});
