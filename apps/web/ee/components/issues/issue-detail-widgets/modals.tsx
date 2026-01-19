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

import type { FC } from "react";
// plane imports
import { observer } from "mobx-react";
// ce imports
import type { TWorkItemAdditionalWidgetModalsProps } from "@/ce/components/issues/issue-detail-widgets/modals";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
// local imports
import { PagesMultiSelectModal } from "./pages/multi-select-modal";

export const WorkItemAdditionalWidgetModals = observer(function WorkItemAdditionalWidgetModals(
  props: TWorkItemAdditionalWidgetModalsProps
) {
  const { issueServiceType, workItemId, workspaceSlug } = props;
  const {
    issue: { getIssueById },
    togglePagesModal,
    isPagesModalOpen,
  } = useIssueDetail(issueServiceType);
  const issue = getIssueById(workItemId);

  return (
    <>
      <PagesMultiSelectModal
        issueServiceType={issueServiceType}
        workspaceSlug={workspaceSlug}
        projectId={issue?.project_id}
        workItemId={workItemId}
        isOpen={isPagesModalOpen === workItemId}
        onClose={() => {
          togglePagesModal(null);
        }}
        selectedPages={[]}
      />
    </>
  );
});
