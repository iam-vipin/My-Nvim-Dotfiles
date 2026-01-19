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
// plane imports
import { EIconSize } from "@plane/constants";
import { CloseIcon, StateGroupIcon } from "@plane/propel/icons";
import type { IState } from "@plane/types";

type Props = {
  handleRemove: (val: string) => void;
  states: IState[];
  values: string[];
  editable: boolean | undefined;
};

export const AppliedStateFilters = observer(function AppliedStateFilters(props: Props) {
  const { handleRemove, states, values, editable } = props;

  return (
    <>
      {values.map((stateId) => {
        const stateDetails = states?.find((s) => s.id === stateId);

        if (!stateDetails) return null;

        return (
          <div key={stateId} className="flex items-center gap-1 rounded-sm bg-layer-1 p-1 text-11">
            <StateGroupIcon
              color={stateDetails.color}
              stateGroup={stateDetails.group}
              size={EIconSize.SM}
              percentage={stateDetails?.order}
            />
            {stateDetails.name}
            {editable && (
              <button
                type="button"
                className="grid place-items-center text-tertiary hover:text-secondary"
                onClick={() => handleRemove(stateId)}
              >
                <CloseIcon height={10} width={10} strokeWidth={2} />
              </button>
            )}
          </div>
        );
      })}
    </>
  );
});
