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
import { range } from "lodash-es";
// components
import { ListLoaderItemRow } from "@/components/ui/loader/layouts/list-layout-loader";

type TWorkspaceDraftIssuesLoader = {
  items?: number;
};

export function WorkspaceDraftIssuesLoader(props: TWorkspaceDraftIssuesLoader) {
  const { items = 14 } = props;
  return (
    <div className="relative h-full w-full">
      {range(items).map((index) => (
        <ListLoaderItemRow key={index} />
      ))}
    </div>
  );
}
