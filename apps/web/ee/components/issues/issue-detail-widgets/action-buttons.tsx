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
import { E_FEATURE_FLAGS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { PageIcon } from "@plane/propel/icons";
import type { TWorkItemAdditionalWidgetActionButtonsProps } from "@/ce/components/issues/issue-detail-widgets/action-buttons";
import { IssueDetailWidgetButton } from "@/components/issues/issue-detail-widgets/widget-button";
import { WithFeatureFlagHOC } from "@/components/feature-flags";
import { PagesActionButton } from "./pages";

export function WorkItemAdditionalWidgetActionButtons(props: TWorkItemAdditionalWidgetActionButtonsProps) {
  const { workspaceSlug, workItemId, disabled, issueServiceType, hideWidgets } = props;
  const { t } = useTranslation();
  return (
    <>
      <WithFeatureFlagHOC workspaceSlug={workspaceSlug} flag={E_FEATURE_FLAGS.LINK_PAGES} fallback={<></>}>
        {!hideWidgets?.includes("pages") && (
          <PagesActionButton
            issueServiceType={issueServiceType}
            disabled={disabled}
            workItemId={workItemId}
            customButton={
              <IssueDetailWidgetButton
                title={t("issue.pages.link_pages")}
                icon={<PageIcon className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />}
                disabled={disabled}
              />
            }
          />
        )}
      </WithFeatureFlagHOC>
    </>
  );
}
