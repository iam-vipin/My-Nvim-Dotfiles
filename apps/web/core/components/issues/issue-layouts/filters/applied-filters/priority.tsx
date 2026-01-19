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

// icons
import { CloseIcon, PriorityIcon } from "@plane/propel/icons";
import type { TIssuePriorities } from "@plane/types";
// types

type Props = {
  handleRemove: (val: string) => void;
  values: string[];
  editable: boolean | undefined;
};

export const AppliedPriorityFilters = observer(function AppliedPriorityFilters(props: Props) {
  const { handleRemove, values, editable } = props;

  return (
    <>
      {values.map((priority) => (
        <div key={priority} className="flex items-center gap-1 rounded-sm bg-layer-1 p-1 text-11">
          <PriorityIcon priority={priority as TIssuePriorities} className={`h-3 w-3`} />
          {priority}
          {editable && (
            <button
              type="button"
              className="grid place-items-center text-tertiary hover:text-secondary"
              onClick={() => handleRemove(priority)}
            >
              <CloseIcon height={10} width={10} strokeWidth={2} />
            </button>
          )}
        </div>
      ))}
    </>
  );
});
