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

import { lazy, Suspense } from "react";
import { observer } from "mobx-react";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useDashboards } from "@/plane-web/hooks/store";

// lazy imports
const CreateProjectModal = lazy(() =>
  import("@/components/project/create-project-modal").then((module) => ({ default: module.CreateProjectModal }))
);
const CreateUpdateCustomerModal = lazy(() =>
  import("@/components/customers/customer-modal").then((module) => ({ default: module.CreateUpdateCustomerModal }))
);
const CreateUpdateWorkspaceDashboardModal = lazy(() =>
  import("@/components/dashboards/modals").then((module) => ({ default: module.CreateUpdateWorkspaceDashboardModal }))
);
const CreateUpdateInitiativeModal = lazy(() =>
  import("@/components/initiatives/components/create-update-initiatives-modal").then((module) => ({
    default: module.CreateUpdateInitiativeModal,
  }))
);
const CreateOrUpdateTeamspaceModal = lazy(() =>
  import("@/components/teamspaces/create-update/modal").then((module) => ({
    default: module.CreateOrUpdateTeamspaceModal,
  }))
);
const CreateUpdateTeamspaceViewModal = lazy(() =>
  import("@/components/teamspaces/views/modals/create-update").then((module) => ({
    default: module.CreateUpdateTeamspaceViewModal,
  }))
);

export type TWorkspaceLevelModalsProps = {
  workspaceSlug: string;
};

export const WorkspaceLevelModals = observer(function WorkspaceLevelModals(props: TWorkspaceLevelModalsProps) {
  // router
  const { workspaceSlug } = props;
  // store hooks
  const {
    isCreateProjectModalOpen,
    toggleCreateProjectModal,
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
    <Suspense>
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => toggleCreateProjectModal(false)}
        workspaceSlug={workspaceSlug}
      />
      <CreateOrUpdateTeamspaceModal
        teamspaceId={createUpdateTeamspaceModal.teamspaceId}
        isModalOpen={createUpdateTeamspaceModal.isOpen}
        handleModalClose={() => toggleCreateTeamspaceModal({ isOpen: false, teamspaceId: undefined })}
      />
      {createUpdateTeamspaceViewModal.teamspaceId && (
        <CreateUpdateTeamspaceViewModal
          isOpen={createUpdateTeamspaceViewModal.isOpen}
          onClose={() => toggleCreateTeamspaceViewModal({ isOpen: false, teamspaceId: undefined })}
          workspaceSlug={workspaceSlug}
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
    </Suspense>
  );
});
