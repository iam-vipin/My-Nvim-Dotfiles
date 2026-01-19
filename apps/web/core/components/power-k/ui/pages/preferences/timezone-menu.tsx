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
import { observer } from "mobx-react";
// hooks
import useTimezone from "@/hooks/use-timezone";
// local imports
import { PowerKModalCommandItem } from "../../modal/command-item";

type Props = {
  onSelect: (timezone: string) => void;
};

export const PowerKPreferencesTimezonesMenu = observer(function PowerKPreferencesTimezonesMenu(props: Props) {
  const { onSelect } = props;
  // timezones
  const { timezones } = useTimezone();

  return (
    <Command.Group>
      {timezones.map((timezone) => (
        <PowerKModalCommandItem
          key={timezone.value}
          onSelect={() => onSelect(timezone.value)}
          label={timezone.content}
        />
      ))}
    </Command.Group>
  );
});
