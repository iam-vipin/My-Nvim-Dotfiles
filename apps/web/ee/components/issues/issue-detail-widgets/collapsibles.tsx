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
import { observer } from "mobx-react";
// plane imports
import { E_FEATURE_FLAGS } from "@plane/constants";
// ce imports
import type { TWorkItemAdditionalWidgetCollapsiblesProps } from "@/ce/components/issues/issue-detail-widgets/collapsibles";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
// plane web imports
import { WithFeatureFlagHOC } from "@/components/feature-flags";
import { CustomerRequestsCollapsible } from "@/plane-web/components/issues/issue-detail-widgets";
import { useCustomers } from "@/plane-web/hooks/store";
// local imports
import { PagesCollapsible } from "./pages";

export const WorkItemAdditionalWidgetCollapsibles = observer(function WorkItemAdditionalWidgetCollapsibles(
  props: TWorkItemAdditionalWidgetCollapsiblesProps
) {
  const { disabled, workspaceSlug, workItemId, hideWidgets, issueServiceType } = props;
  // store hooks
  const {
    issue: { getIssueById },
  } = useIssueDetail(issueServiceType);
  const { isCustomersFeatureEnabled } = useCustomers();

  // derived values
  const issue = getIssueById(workItemId);
  const shouldRenderCustomerRequest = Boolean(issue?.customer_request_ids?.length) && !issue?.is_epic;
  const shouldRenderPages = !hideWidgets?.includes("pages");
  return (
    <>
      {shouldRenderCustomerRequest && isCustomersFeatureEnabled && (
        <CustomerRequestsCollapsible workItemId={workItemId} workspaceSlug={workspaceSlug} disabled={disabled} />
      )}
      <WithFeatureFlagHOC workspaceSlug={workspaceSlug} flag={E_FEATURE_FLAGS.LINK_PAGES} fallback={<></>}>
        {shouldRenderPages && (
          <PagesCollapsible
            workItemId={workItemId}
            workspaceSlug={workspaceSlug}
            disabled={disabled}
            projectId={issue?.project_id}
            issueServiceType={issueServiceType}
          />
        )}
      </WithFeatureFlagHOC>
    </>
  );
});
