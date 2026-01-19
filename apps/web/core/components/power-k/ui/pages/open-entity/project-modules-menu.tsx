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
import type { IModule } from "@plane/types";
import { Spinner } from "@plane/ui";
// components
import type { TPowerKContext } from "@/components/power-k/core/types";
import { PowerKModulesMenu } from "@/components/power-k/menus/modules";
// hooks
import { useModule } from "@/hooks/store/use-module";

type Props = {
  context: TPowerKContext;
  handleSelect: (module: IModule) => void;
};

export const PowerKOpenProjectModulesMenu = observer(function PowerKOpenProjectModulesMenu(props: Props) {
  const { context, handleSelect } = props;
  // store hooks
  const { fetchedMap, getProjectModuleIds, getModuleById } = useModule();
  // derived values
  const projectId = context.params.projectId?.toString();
  const isFetched = projectId ? fetchedMap[projectId] : false;
  const projectModuleIds = projectId ? getProjectModuleIds(projectId) : undefined;
  const modulesList = projectModuleIds
    ? projectModuleIds.map((moduleId) => getModuleById(moduleId)).filter((module) => !!module)
    : [];

  if (!isFetched) return <Spinner />;

  return <PowerKModulesMenu modules={modulesList} onSelect={handleSelect} />;
});
