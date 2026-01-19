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
import { Command } from "cmdk";
// plane imports
import { START_OF_THE_WEEK_OPTIONS } from "@plane/constants";
import type { EStartOfTheWeek } from "@plane/types";
// local imports
import { PowerKModalCommandItem } from "../../modal/command-item";

type Props = {
  onSelect: (day: EStartOfTheWeek) => void;
};

export function PowerKPreferencesStartOfWeekMenu(props: Props) {
  const { onSelect } = props;

  return (
    <Command.Group>
      {START_OF_THE_WEEK_OPTIONS.map((day) => (
        <PowerKModalCommandItem key={day.value} onSelect={() => onSelect(day.value)} label={day.label} />
      ))}
    </Command.Group>
  );
}
