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

import { EIconSize } from "@plane/constants";
import { StateGroupIcon } from "@plane/propel/icons";
import type { TStateGroups } from "@plane/types";
import { cn } from "@plane/ui";
import { addSpaceIfCamelCase } from "@plane/utils";

export function DisplayState(props: {
  className?: string;
  state: {
    group?: TStateGroups;
    color?: string;
    name: string;
  };
  iconSize?: EIconSize;
}) {
  const { state, className, iconSize } = props;
  return (
    <div className={cn("flex items-center gap-1 text-13 text-tertiary", className)}>
      {state.group && (
        <StateGroupIcon stateGroup={state?.group ?? "backlog"} color={state?.color} size={iconSize ?? EIconSize.LG} />
      )}
      <div>{addSpaceIfCamelCase(state?.name ?? "")}</div>
    </div>
  );
}
