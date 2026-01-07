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
import { CloseIcon, CycleGroupIcon } from "@plane/propel/icons";
import type { TCycleGroups } from "@plane/types";
// hooks
import { useCycle } from "@/hooks/store/use-cycle";
// ui
// types

type Props = {
  handleRemove: (val: string) => void;
  values: string[];
};

export const AppliedCycleFilters = observer(function AppliedCycleFilters(props: Props) {
  const { handleRemove, values } = props;
  // store hooks
  const { getCycleById } = useCycle();

  return (
    <>
      {values.map((cycleId) => {
        const cycleDetails = getCycleById(cycleId) ?? null;

        if (!cycleDetails) return null;

        const cycleStatus = (cycleDetails?.status ? cycleDetails?.status.toLocaleLowerCase() : "draft") as TCycleGroups;

        return (
          <div key={cycleId} className="flex items-center gap-1 rounded-sm bg-layer-3 p-1 text-11 truncate">
            <CycleGroupIcon cycleGroup={cycleStatus} className="h-3 w-3 flex-shrink-0" />
            <span className="normal-case truncate">{cycleDetails.name}</span>
            <button
              type="button"
              className="grid place-items-center text-tertiary hover:text-secondary"
              onClick={() => handleRemove(cycleId)}
            >
              <CloseIcon height={10} width={10} strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </>
  );
});
