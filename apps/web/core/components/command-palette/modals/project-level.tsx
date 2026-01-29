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
import { useParams } from "react-router";
// plane imports
import { EIssueServiceType } from "@plane/types";
import type { TIssue } from "@plane/types";
// hooks
import { useCommandPalette } from "@/hooks/store/use-command-palette";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useAutomations } from "@/plane-web/hooks/store/automations/use-automations";
import { EPageStoreType } from "@/plane-web/hooks/store/use-page-store";

// lazy imports
const CycleCreateUpdateModal = lazy(() =>
  import("@/components/cycles/modal").then((module) => ({ default: module.CycleCreateUpdateModal }))
);
const CreateUpdateModuleModal = lazy(() =>
  import("@/components/modules").then((module) => ({ default: module.CreateUpdateModuleModal }))
);
const CreatePageModal = lazy(() =>
  import("@/components/pages/modals/create-page-modal").then((module) => ({ default: module.CreatePageModal }))
);
const CreateUpdateProjectViewModal = lazy(() =>
  import("@/components/views/modal").then((module) => ({ default: module.CreateUpdateProjectViewModal }))
);
const CreateUpdateAutomationModal = lazy(() =>
  import("@/components/automations/modals/create-update-modal").then((module) => ({
    default: module.CreateUpdateAutomationModal,
  }))
);
const CreateUpdateIssueModal = lazy(() =>
  import("@/components/issues/issue-modal/modal").then((module) => ({ default: module.CreateUpdateIssueModal }))
);
const BulkDeleteIssuesModal = lazy(() =>
  import("@/components/core/modals/bulk-delete-issues-modal").then((module) => ({
    default: module.BulkDeleteIssuesModal,
  }))
);

export type TProjectLevelModalsProps = {
  workspaceSlug: string;
  projectId: string;
};

export const ProjectLevelModals = observer(function ProjectLevelModals(props: TProjectLevelModalsProps) {
  const { workspaceSlug, projectId } = props;
  // router
  const { cycleId, moduleId, workItem: workItemIdentifier } = useParams();
  // store hooks
  const {
    isCreateIssueModalOpen,
    toggleCreateIssueModal,
    isBulkDeleteIssueModalOpen,
    toggleBulkDeleteIssueModal,
    isCreateCycleModalOpen,
    toggleCreateCycleModal,
    isCreateModuleModalOpen,
    toggleCreateModuleModal,
    isCreateViewModalOpen,
    toggleCreateViewModal,
    createPageModal,
    toggleCreatePageModal,
    createWorkItemAllowedProjectIds,
  } = useCommandPalette();
  const {
    issue: { getIssueById, getIssueIdByIdentifier },
  } = useIssueDetail();
  const { fetchSubIssues: fetchSubWorkItems } = useIssueDetail(EIssueServiceType.ISSUES);
  const { fetchSubIssues: fetchEpicSubWorkItems } = useIssueDetail(EIssueServiceType.EPICS);
  const {
    projectAutomations: { createUpdateModalConfig, setCreateUpdateModalConfig },
  } = useAutomations();
  // derived values
  const workItemId = workItemIdentifier ? getIssueIdByIdentifier(workItemIdentifier) : undefined;
  const workItemDetails = workItemId ? getIssueById(workItemId) : undefined;

  const handleWorkItemSubmit = async (newWorkItem: TIssue) => {
    if (!newWorkItem.project_id || !newWorkItem.id || newWorkItem.parent_id !== workItemDetails?.id) return;

    const fetchAction = workItemDetails?.is_epic ? fetchEpicSubWorkItems : fetchSubWorkItems;
    await fetchAction(workspaceSlug, newWorkItem.project_id, workItemDetails.id);
  };

  const getCreateIssueModalData = () => {
    if (cycleId) return { cycle_id: cycleId };
    if (moduleId) return { module_ids: [moduleId] };
    return undefined;
  };

  return (
    <Suspense>
      <CreateUpdateIssueModal
        isOpen={isCreateIssueModalOpen}
        onClose={() => toggleCreateIssueModal(false)}
        data={getCreateIssueModalData()}
        onSubmit={handleWorkItemSubmit}
        allowedProjectIds={createWorkItemAllowedProjectIds}
      />
      <BulkDeleteIssuesModal isOpen={isBulkDeleteIssueModalOpen} onClose={() => toggleBulkDeleteIssueModal(false)} />
      <CycleCreateUpdateModal
        isOpen={isCreateCycleModalOpen}
        handleClose={() => toggleCreateCycleModal(false)}
        workspaceSlug={workspaceSlug}
        projectId={projectId}
      />
      <CreateUpdateModuleModal
        isOpen={isCreateModuleModalOpen}
        onClose={() => toggleCreateModuleModal(false)}
        workspaceSlug={workspaceSlug}
        projectId={projectId}
      />
      <CreateUpdateProjectViewModal
        isOpen={isCreateViewModalOpen}
        onClose={() => toggleCreateViewModal(false)}
        workspaceSlug={workspaceSlug}
        projectId={projectId}
      />
      <CreatePageModal
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        isModalOpen={createPageModal.isOpen}
        pageAccess={createPageModal.pageAccess}
        handleModalClose={() => toggleCreatePageModal({ isOpen: false })}
        redirectionEnabled
        storeType={EPageStoreType.PROJECT}
      />
      <CreateUpdateAutomationModal
        isOpen={createUpdateModalConfig.isOpen}
        data={createUpdateModalConfig.payload ?? undefined}
        onClose={() => setCreateUpdateModalConfig({ isOpen: false, payload: null })}
      />
    </Suspense>
  );
});
