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
// local imports
import { ArchivedIssueQuickActions } from "../../quick-action-dropdowns";
import { BaseListRoot } from "../base-list-root";

export const ArchivedIssueListLayout = observer(function ArchivedIssueListLayout() {
  const canEditPropertiesBasedOnProject = () => false;

  return (
    <BaseListRoot
      QuickActions={ArchivedIssueQuickActions}
      canEditPropertiesBasedOnProject={canEditPropertiesBasedOnProject}
    />
  );
});
