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
import { Layers } from "lucide-react";
// plane imports
import type { IProjectView } from "@plane/types";
// local imports
import { PowerKMenuBuilder } from "./builder";

type Props = {
  views: IProjectView[];
  onSelect: (view: IProjectView) => void;
};

export const PowerKViewsMenu = observer(function PowerKViewsMenu({ views, onSelect }: Props) {
  return (
    <PowerKMenuBuilder
      items={views}
      getKey={(view) => view.id}
      getIcon={() => Layers}
      getValue={(view) => view.name}
      getLabel={(view) => view.name}
      onSelect={onSelect}
      emptyText="No views found"
    />
  );
});
