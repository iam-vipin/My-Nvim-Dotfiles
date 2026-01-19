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
// ui
import { DragHandle } from "@plane/ui";
// helper
import { cn } from "@plane/utils";

type Props = {
  isDragging: boolean;
};

export const StickyItemDragHandle = observer(function StickyItemDragHandle(props: Props) {
  const { isDragging } = props;

  return (
    <div
      className={cn(
        "hidden group-hover/sticky:flex absolute top-3 left-1/2 -translate-x-1/2 items-center justify-center rounded-sm text-placeholder cursor-grab mr-2 rotate-90",
        {
          "cursor-grabbing": isDragging,
        }
      )}
    >
      <DragHandle className="bg-transparent" />
    </div>
  );
});
