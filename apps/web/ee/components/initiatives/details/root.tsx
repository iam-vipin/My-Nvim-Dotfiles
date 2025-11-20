import { observer } from "mobx-react";
// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import type { TInitiativeStates } from "@plane/types";
import { EUserWorkspaceRoles } from "@plane/types";
// hooks
import { useUserPermissions } from "@/hooks/store/user";
// plane web imports
import { LayoutRoot } from "@/plane-web/components/common/layout";
import { EpicPeekOverview } from "@/plane-web/components/epics/peek-overview";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
// local imports
import { InitiativeEmptyState } from "../details/empty-state";
import { InitiativeMainContentRoot } from "./main/root";
import { InitiativeSidebarRoot } from "./sidebar/root";

type Props = {
  workspaceSlug: string;
  initiativeId: string;
};

export const InitiativeDetailRoot = observer((props: Props) => {
  const { workspaceSlug, initiativeId } = props;
  // store hooks
  const {
    initiative: { getInitiativeById, updateInitiative, fetchInitiativeAnalytics },
  } = useInitiatives();
  const { allowPermissions } = useUserPermissions();

  const { t } = useTranslation();

  // derived values
  const initiative = getInitiativeById(initiativeId);
  const isEditable = allowPermissions(
    [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER],
    EUserPermissionsLevel.WORKSPACE
  );

  // handlers
  const handleInitiativeLabelUpdate = (labelIds: string[]) => {
    if (!initiativeId) return;
    try {
      updateInitiative(workspaceSlug?.toString(), initiativeId, { label_ids: labelIds }).then(() => {
        fetchInitiativeAnalytics(workspaceSlug, initiativeId);
      });
    } catch {
      setToast({
        title: t("toast.error"),
        type: TOAST_TYPE.ERROR,
        message: t("initiatives.toast.label_update_error"),
      });
    }
  };

  const handleInitiativeStateUpdate = (state: TInitiativeStates) => {
    try {
      if (!initiativeId) return;
      updateInitiative(workspaceSlug, initiativeId, { state }).then(() => {
        fetchInitiativeAnalytics(workspaceSlug, initiativeId);
      });
    } catch {
      setToast({
        title: t("toast.error"),
        type: TOAST_TYPE.ERROR,
        message: t("initiatives.toast.state_update_error"),
      });
    }
  };

  return (
    <LayoutRoot
      renderEmptyState={!initiative}
      emptyStateComponent={<InitiativeEmptyState workspaceSlug={workspaceSlug} />}
    >
      <InitiativeMainContentRoot workspaceSlug={workspaceSlug} initiativeId={initiativeId} disabled={!isEditable} />
      <InitiativeSidebarRoot
        workspaceSlug={workspaceSlug}
        initiativeId={initiativeId}
        disabled={!isEditable}
        handleInitiativeStateUpdate={handleInitiativeStateUpdate}
        handleInitiativeLabelUpdate={handleInitiativeLabelUpdate}
      />
      <EpicPeekOverview />
    </LayoutRoot>
  );
});
