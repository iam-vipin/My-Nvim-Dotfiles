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

import { BoardLayoutIcon, ListLayoutIcon, TimelineLayoutIcon } from "@plane/propel/icons";
import type { IBaseLayoutConfig } from "@plane/types";

export const BASE_LAYOUTS: IBaseLayoutConfig[] = [
  {
    key: "list",
    icon: ListLayoutIcon,
    i18n_title: "issue.layouts.title.list",
  },
  {
    key: "kanban",
    icon: BoardLayoutIcon,
    i18n_title: "issue.layouts.title.kanban",
  },
  {
    key: "gantt",
    icon: TimelineLayoutIcon,
    i18n_title: "issue.layouts.title.gantt",
  },
];
