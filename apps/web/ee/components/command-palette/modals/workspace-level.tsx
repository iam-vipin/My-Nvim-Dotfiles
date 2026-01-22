/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import { observer } from "mobx-react";
// ce components
import type { TWorkspaceLevelModalsProps } from "@/ce/components/command-palette/modals/workspace-level";
import { WorkspaceLevelModals as BaseWorkspaceLevelModals } from "@/ce/components/command-palette/modals/workspace-level";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
// plane web components
import { CreateUpdateCustomerModal } from "@/components/customers/customer-modal";
import { CreateUpdateWorkspaceDashboardModal } from "@/components/dashboards/modals";
import { CreateUpdateInitiativeModal } from "@/components/initiatives/components/create-update-initiatives-modal";
import { CreateOrUpdateTeamspaceModal } from "@/components/teamspaces/create-update/modal";
import { CreateUpdateTeamspaceViewModal } from "@/components/teamspaces/views/modals/create-update";
import { useDashboards } from "@/plane-web/hooks/store";

export const WorkspaceLevelModals = observer(function WorkspaceLevelModals(props: TWorkspaceLevelModalsProps) {
  // router
  const { workspaceSlug } = props;

  const {
    createUpdateTeamspaceModal,
    toggleCreateTeamspaceModal,
    createUpdateTeamspaceViewModal,
    toggleCreateTeamspaceViewModal,
    createUpdateInitiativeModal,
    toggleCreateInitiativeModal,
    createUpdateCustomerModal,
    toggleCreateCustomerModal,
  } = useCommandPalette();
  const {
    workspaceDashboards: {
      isCreateUpdateModalOpen: isWorkspaceDashboardModalOpen,
      createUpdateModalPayload: workspaceDashboardModalPayload,
      toggleCreateUpdateModal: toggleWorkspaceDashboardModal,
      updateCreateUpdateModalPayload: updateWorkspaceDashboardModalPayload,
    },
  } = useDashboards();

  return (
    <>
      <BaseWorkspaceLevelModals {...props} />
      <CreateOrUpdateTeamspaceModal
        teamspaceId={createUpdateTeamspaceModal.teamspaceId}
        isModalOpen={createUpdateTeamspaceModal.isOpen}
        handleModalClose={() => toggleCreateTeamspaceModal({ isOpen: false, teamspaceId: undefined })}
      />
      {createUpdateTeamspaceViewModal.teamspaceId && (
        <CreateUpdateTeamspaceViewModal
          isOpen={createUpdateTeamspaceViewModal.isOpen}
          onClose={() => toggleCreateTeamspaceViewModal({ isOpen: false, teamspaceId: undefined })}
          workspaceSlug={workspaceSlug.toString()}
          teamspaceId={createUpdateTeamspaceViewModal.teamspaceId}
        />
      )}
      <CreateUpdateInitiativeModal
        isOpen={createUpdateInitiativeModal.isOpen}
        handleClose={() => toggleCreateInitiativeModal({ isOpen: false, initiativeId: undefined })}
      />
      <CreateUpdateWorkspaceDashboardModal
        data={workspaceDashboardModalPayload ?? undefined}
        isOpen={isWorkspaceDashboardModalOpen}
        onClose={() => {
          toggleWorkspaceDashboardModal(false);
          setTimeout(() => {
            updateWorkspaceDashboardModalPayload(null);
          }, 300);
        }}
      />
      <CreateUpdateCustomerModal
        isOpen={createUpdateCustomerModal.isOpen}
        customerId={createUpdateCustomerModal.customerId}
        onClose={() => toggleCreateCustomerModal({ isOpen: false, customerId: undefined })}
      />
    </>
  );
});
