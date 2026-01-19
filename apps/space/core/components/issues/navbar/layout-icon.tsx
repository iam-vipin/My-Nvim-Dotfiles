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

import type { TIssueLayout } from "@plane/constants";
import { ListLayoutIcon, BoardLayoutIcon } from "@plane/propel/icons";
import type { ISvgIcons } from "@plane/propel/icons";

export function IssueLayoutIcon({
  layout,
  size,
  ...props
}: { layout: TIssueLayout; size?: number } & Omit<ISvgIcons, "width" | "height">) {
  const iconProps = {
    ...props,
    ...(size && { width: size, height: size }),
  };

  switch (layout) {
    case "list":
      return <ListLayoutIcon {...iconProps} />;
    case "kanban":
      return <BoardLayoutIcon {...iconProps} />;
    default:
      return null;
  }
}
