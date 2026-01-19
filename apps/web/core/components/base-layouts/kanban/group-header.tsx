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

import type { IGroupHeaderProps } from "@plane/types";

export function GroupHeader({ group, itemCount, onToggleGroup }: IGroupHeaderProps) {
  return (
    <button
      onClick={() => onToggleGroup(group.id)}
      className="flex w-full items-center gap-2 text-13 font-medium text-secondary"
    >
      <div className="flex items-center gap-2">
        {group.icon}
        <span>{group.name}</span>
      </div>
      <span className="text-11 text-tertiary">{itemCount}</span>
    </button>
  );
}
