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
import React from "react";
import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
// ce imports
import type { TCustomAutomationsRootProps } from "@/ce/components/automations/root";
// plane web imports
import { CreateAutomationButton } from "@/plane-web/components/automations/create-button";
import { AutomationsListRoot } from "@/plane-web/components/automations/list/root";
import { WithFeatureFlagHOC } from "@/components/feature-flags/with-feature-flag-hoc";
import { useAutomations } from "@/plane-web/hooks/store/automations/use-automations";

export const CustomAutomationsRoot = observer(function CustomAutomationsRoot(props: TCustomAutomationsRootProps) {
  const { projectId, workspaceSlug } = props;
  // store hooks
  const {
    projectAutomations: { isAnyAutomationAvailableForProject, canCurrentUserCreateAutomation },
  } = useAutomations();
  // translation
  const { t } = useTranslation();

  // TODO: Add upgrade empty state as fallback
  return (
    <WithFeatureFlagHOC flag="PROJECT_AUTOMATIONS" fallback={<></>} workspaceSlug={workspaceSlug}>
      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center justify-between border-b border-subtle py-4">
        <div className="flex flex-col items-start gap-1">
          <h4 className="text-14 font-medium">{t("automations.settings.title")}</h4>
        </div>
        {isAnyAutomationAvailableForProject(projectId) && canCurrentUserCreateAutomation && <CreateAutomationButton />}
      </div>
      <AutomationsListRoot projectId={projectId} />
    </WithFeatureFlagHOC>
  );
});
