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

import type { TNotificationsViewMode } from "@/store/notifications/workspace-notifications.store";
import { useTranslation } from "@plane/i18n";
import { CenterPanelIcon, FullScreenPanelIcon } from "@plane/propel/icons";
import { Menu } from "@plane/propel/menu";
import { CheckIcon } from "lucide-react";

const VIEW_MODES = [
  { key: "compact", icon: CenterPanelIcon, i18n_label: "account_settings.notifications.compact" },
  { key: "full", icon: FullScreenPanelIcon, i18n_label: "account_settings.notifications.full" },
] as const;

type ViewModeSelectorProps = {
  value: TNotificationsViewMode;
  onChange: (mode: TNotificationsViewMode) => void;
};

export function ViewModeSelector({ value, onChange }: ViewModeSelectorProps) {
  const CurrentIcon = VIEW_MODES.find((m) => m.key === value)?.icon;
  const { t } = useTranslation();

  return (
    <Menu
      ariaLabel={t("account_settings.notifications.select_default_view")}
      customButton={
        <span className="flex items-center justify-center">
          {CurrentIcon && <CurrentIcon className="h-4 w-4 text-tertiary hover:text-secondary" />}
        </span>
      }
      optionsClassName="p-1"
    >
      <div className="text-tertiary text-12 px-2 py-1">{t("account_settings.notifications.select_default_view")}</div>
      {VIEW_MODES.map(({ key, icon: Icon, i18n_label }) => {
        const selected = key === value;
        return (
          <Menu.MenuItem key={key} onClick={() => onChange(key)}>
            <div className="flex items-center justify-between w-full px-1">
              <div className="flex items-center gap-1.5">
                <Icon className="h-4 w-4" />
                {t(i18n_label)}
              </div>
              {selected && <CheckIcon className="h-4 w-4" />}
            </div>
          </Menu.MenuItem>
        );
      })}
    </Menu>
  );
}
