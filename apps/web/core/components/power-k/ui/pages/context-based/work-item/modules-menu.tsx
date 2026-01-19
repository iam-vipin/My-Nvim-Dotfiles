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
// plane types
import type { IModule, TIssue } from "@plane/types";
import { Spinner } from "@plane/ui";
// components
import { PowerKModulesMenu } from "@/components/power-k/menus/modules";
// hooks
import { useModule } from "@/hooks/store/use-module";

type Props = {
  handleSelect: (module: IModule) => void;
  workItemDetails: TIssue;
};

export const PowerKWorkItemModulesMenu = observer(function PowerKWorkItemModulesMenu(props: Props) {
  const { handleSelect, workItemDetails } = props;
  // store hooks
  const { getProjectModuleIds, getModuleById } = useModule();
  // derived values
  const projectModuleIds = workItemDetails.project_id ? getProjectModuleIds(workItemDetails.project_id) : undefined;
  const modulesList = projectModuleIds ? projectModuleIds.map((moduleId) => getModuleById(moduleId)) : undefined;
  const filteredModulesList = modulesList ? modulesList.filter((module) => !!module) : undefined;

  if (!filteredModulesList) return <Spinner />;

  return (
    <PowerKModulesMenu modules={filteredModulesList} onSelect={handleSelect} value={workItemDetails.module_ids ?? []} />
  );
});
