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
import { observer } from "mobx-react";
// local imports
import { PowerKMenuBuilder } from "./builder";

type TSettingItem = {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
};

type Props = {
  settings: TSettingItem[];
  onSelect: (setting: TSettingItem) => void;
};

export const PowerKSettingsMenu = observer(function PowerKSettingsMenu({ settings, onSelect }: Props) {
  return (
    <PowerKMenuBuilder
      items={settings}
      getKey={(setting) => setting.key}
      getIcon={(setting) => setting.icon}
      getValue={(setting) => setting.label}
      getLabel={(setting) => setting.label}
      onSelect={onSelect}
      emptyText="No settings found"
    />
  );
});
