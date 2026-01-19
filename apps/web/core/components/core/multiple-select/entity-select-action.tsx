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
import { Checkbox } from "@plane/ui";
// helpers
import { cn } from "@plane/utils";
// hooks
import type { TSelectionHelper } from "@/hooks/use-multiple-select";

type Props = {
  className?: string;
  disabled?: boolean;
  groupId: string;
  id: string;
  selectionHelpers: TSelectionHelper;
};

export const MultipleSelectEntityAction = observer(function MultipleSelectEntityAction(props: Props) {
  const { className, disabled = false, groupId, id, selectionHelpers } = props;
  // derived values
  const isSelected = selectionHelpers.getIsEntitySelected(id);

  if (selectionHelpers.isSelectionDisabled) return null;

  return (
    <Checkbox
      className={cn("!outline-none size-3.5", className)}
      iconClassName="size-3"
      onClick={(e) => {
        e.stopPropagation();
        selectionHelpers.handleEntityClick(e, id, groupId);
      }}
      checked={isSelected}
      data-entity-group-id={groupId}
      data-entity-id={id}
      disabled={disabled}
      readOnly
    />
  );
});
