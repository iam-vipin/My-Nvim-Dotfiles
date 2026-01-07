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
import type { TWorkItemLevelModalsProps } from "@/ce/components/command-palette/modals/work-item-level";
import { WorkItemLevelModals as BaseWorkItemLevelModals } from "@/ce/components/command-palette/modals/work-item-level";

export const WorkItemLevelModals = observer(function WorkItemLevelModals(props: TWorkItemLevelModalsProps) {
  return (
    <>
      <BaseWorkItemLevelModals {...props} />
    </>
  );
});
