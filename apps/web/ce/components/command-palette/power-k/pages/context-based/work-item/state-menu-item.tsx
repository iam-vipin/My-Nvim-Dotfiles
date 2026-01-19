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
// plane types
import { StateGroupIcon } from "@plane/propel/icons";
import type { IState } from "@plane/types";
// components
import { PowerKModalCommandItem } from "@/components/power-k/ui/modal/command-item";

export type TPowerKProjectStatesMenuItemsProps = {
  handleSelect: (stateId: string) => void;
  projectId: string | undefined;
  selectedStateId: string | undefined;
  states: IState[];
  workspaceSlug: string;
};

export const PowerKProjectStatesMenuItems = observer(function PowerKProjectStatesMenuItems(
  props: TPowerKProjectStatesMenuItemsProps
) {
  const { handleSelect, selectedStateId, states } = props;

  return (
    <>
      {states.map((state) => (
        <PowerKModalCommandItem
          key={state.id}
          iconNode={<StateGroupIcon stateGroup={state.group} color={state.color} className="shrink-0 size-3.5" />}
          label={state.name}
          isSelected={state.id === selectedStateId}
          onSelect={() => handleSelect(state.id)}
        />
      ))}
    </>
  );
});
