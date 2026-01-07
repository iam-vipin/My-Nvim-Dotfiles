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
import { CloseIcon, DiceIcon } from "@plane/propel/icons";
// hooks
import { useModule } from "@/hooks/store/use-module";
// ui

type Props = {
  handleRemove: (val: string) => void;
  values: string[];
};

export const AppliedModuleFilters = observer(function AppliedModuleFilters(props: Props) {
  const { handleRemove, values } = props;
  // store hooks
  const { getModuleById } = useModule();

  return (
    <>
      {values.map((moduleId) => {
        const moduleDetails = getModuleById(moduleId) ?? null;

        if (!moduleDetails) return null;

        return (
          <div key={moduleId} className="flex items-center gap-1 rounded-sm bg-layer-3 p-1 text-11 truncate">
            <DiceIcon className="h-3 w-3 flex-shrink-0" />
            <span className="normal-case truncate">{moduleDetails.name}</span>
            <button
              type="button"
              className="grid place-items-center text-tertiary hover:text-secondary"
              onClick={() => handleRemove(moduleId)}
            >
              <CloseIcon height={10} width={10} strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </>
  );
});
