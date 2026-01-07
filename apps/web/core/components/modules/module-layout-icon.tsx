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

import * as React from "react";
import { TimelineLayoutIcon, GridLayoutIcon, ListLayoutIcon } from "@plane/propel/icons";
import type { TModuleLayoutOptions } from "@plane/types";
import { cn } from "@plane/utils";

interface ILayoutIcon {
  className?: string;
  containerClassName?: string;
  layoutType: TModuleLayoutOptions;
  size?: number;
  withContainer?: boolean;
}

export function ModuleLayoutIcon(props: ILayoutIcon) {
  const { layoutType, className = "", containerClassName = "", size = 14, withContainer = false } = props;

  // get Layout icon
  const icons = {
    list: ListLayoutIcon,
    board: GridLayoutIcon,
    gantt: TimelineLayoutIcon,
  };
  const Icon = icons[layoutType ?? "list"];

  if (!Icon) return null;

  return (
    <>
      {withContainer ? (
        <div
          className={cn("flex items-center justify-center border rounded-sm p-0.5 flex-shrink-0", containerClassName)}
        >
          <Icon width={size} height={size} className={cn(className)} />
        </div>
      ) : (
        <Icon width={size} height={size} className={cn("flex-shrink-0", className)} />
      )}
    </>
  );
}
