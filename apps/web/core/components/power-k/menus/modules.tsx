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

import React from "react";
import { observer } from "mobx-react";
// plane imports
import { ModuleStatusIcon } from "@plane/propel/icons";
import type { IModule } from "@plane/types";
// local imports
import { PowerKMenuBuilder } from "./builder";

type Props = {
  modules: IModule[];
  onSelect: (module: IModule) => void;
  value?: string[];
};

export const PowerKModulesMenu = observer(function PowerKModulesMenu({ modules, onSelect, value }: Props) {
  return (
    <PowerKMenuBuilder
      items={modules}
      getKey={(module) => module.id}
      getIconNode={(module) => <ModuleStatusIcon status={module.status ?? "backlog"} className="shrink-0 size-3.5" />}
      getValue={(module) => module.name}
      getLabel={(module) => module.name}
      isSelected={(module) => !!value?.includes(module.id)}
      onSelect={onSelect}
      emptyText="No modules found"
    />
  );
});
