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

import React from "react";
// hooks
import { usePowerK } from "@/hooks/store/use-power-k";
// local imports
import type { TPowerKCommandConfig, TPowerKContext } from "../../core/types";
import { CommandRenderer } from "../renderer/command";

type Props = {
  context: TPowerKContext;
  onCommandSelect: (command: TPowerKCommandConfig) => void;
};

export function PowerKModalDefaultPage(props: Props) {
  const { context, onCommandSelect } = props;
  // store hooks
  const { commandRegistry } = usePowerK();
  // Get commands to display
  const commands = commandRegistry.getVisibleCommands(context);

  return <CommandRenderer context={context} commands={commands} onCommandSelect={onCommandSelect} />;
}
