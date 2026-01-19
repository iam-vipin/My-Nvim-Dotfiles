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

// ui
import { Checkbox } from "@plane/ui";
// helpers
import { cn } from "@plane/utils";
// hooks
import type { TSelectionHelper } from "@/hooks/use-multiple-select";

type Props = {
  className?: string;
  disabled?: boolean;
  groupID: string;
  selectionHelpers: TSelectionHelper;
};

export function MultipleSelectGroupAction(props: Props) {
  const { className, disabled = false, groupID, selectionHelpers } = props;
  // derived values
  const groupSelectionStatus = selectionHelpers.isGroupSelected(groupID);

  if (selectionHelpers.isSelectionDisabled) return null;

  return (
    <Checkbox
      className={cn("size-3.5 !outline-none", className)}
      iconClassName="size-3"
      onClick={() => selectionHelpers.handleGroupClick(groupID)}
      checked={groupSelectionStatus === "complete"}
      indeterminate={groupSelectionStatus === "partial"}
      disabled={disabled}
    />
  );
}
