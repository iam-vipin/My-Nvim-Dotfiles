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
import { ContrastIcon } from "@plane/propel/icons";
import type { ICycle } from "@plane/types";
// local imports
import { PowerKMenuBuilder } from "./builder";

type Props = {
  cycles: ICycle[];
  onSelect: (cycle: ICycle) => void;
  value?: string | null;
};

export const PowerKCyclesMenu = observer(function PowerKCyclesMenu({ cycles, onSelect, value }: Props) {
  return (
    <PowerKMenuBuilder
      items={cycles}
      getIcon={() => ContrastIcon}
      getKey={(cycle) => cycle.id}
      getValue={(cycle) => cycle.name}
      getLabel={(cycle) => cycle.name}
      isSelected={(cycle) => value === cycle.id}
      onSelect={onSelect}
      emptyText="No cycles found"
    />
  );
});
