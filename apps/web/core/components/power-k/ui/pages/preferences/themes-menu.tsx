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

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { observer } from "mobx-react";
// plane imports
import { THEME_OPTIONS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
// local imports
import { PowerKModalCommandItem } from "../../modal/command-item";

type Props = {
  onSelect: (theme: string) => void;
};

export const PowerKPreferencesThemesMenu = observer(function PowerKPreferencesThemesMenu(props: Props) {
  const { onSelect } = props;
  // hooks
  const { t } = useTranslation();
  // states
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Command.Group>
      {THEME_OPTIONS.map((theme) => (
        <PowerKModalCommandItem key={theme.value} onSelect={() => onSelect(theme.value)} label={t(theme.i18n_label)} />
      ))}
    </Command.Group>
  );
});
