import { useMemo } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import { EUserWorkspaceRoles, EIssueLayoutTypes } from "@plane/types";
// hooks
import { useUserPermissions } from "@/hooks/store/user";
// plane web imports
import { EpicPeekOverview } from "@/plane-web/components/epics/peek-overview";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
// local imports
import { InitiativeScopeGanttView } from "./gantt/root";
import { InitiativeScopeListView } from "./list/root";

export const InitiativeScopeRoot = observer(function InitiativeScopeRoot() {
  const { initiativeId, workspaceSlug } = useParams();
  // store hooks
  const {
    initiative: {
      scope: { getDisplayFilters },
      epics: { getInitiativeEpicsById },
      getInitiativeById,
      toggleEpicModal,
      toggleProjectsModal,
    },
  } = useInitiatives();
  const { allowPermissions } = useUserPermissions();
  // derived values
  const initiative = getInitiativeById(initiativeId?.toString());
  const initiativeEpics = getInitiativeEpicsById(initiativeId?.toString());
  const isEditable = allowPermissions(
    [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  const displayFilters = getDisplayFilters(initiativeId?.toString());
  const activeLayout = displayFilters?.activeLayout as EIssueLayoutTypes.LIST | EIssueLayoutTypes.GANTT;

  // Common props for scope views
  const scopeViewProps = useMemo(
    () => ({
      epicIds: initiativeEpics ?? [],
      projectIds: initiative?.project_ids ?? [],
      workspaceSlug: workspaceSlug?.toString(),
      initiativeId: initiativeId?.toString(),
      disabled: !isEditable,
      handleAddEpic: () => toggleEpicModal(true),
      handleAddProject: () => toggleProjectsModal(true),
    }),
    [initiativeEpics, initiative, workspaceSlug, initiativeId, isEditable, toggleEpicModal, toggleProjectsModal]
  );

  // Layout components mapping
  const INITIATIVE_SCOPE_ACTIVE_LAYOUTS = useMemo(
    () => ({
      [EIssueLayoutTypes.LIST]: <InitiativeScopeListView {...scopeViewProps} />,
      [EIssueLayoutTypes.GANTT]: <InitiativeScopeGanttView {...scopeViewProps} />,
    }),
    [scopeViewProps]
  );

  if (!activeLayout) return <></>;

  return (
    <>
      {INITIATIVE_SCOPE_ACTIVE_LAYOUTS[activeLayout]}
      <EpicPeekOverview />
    </>
  );
});
