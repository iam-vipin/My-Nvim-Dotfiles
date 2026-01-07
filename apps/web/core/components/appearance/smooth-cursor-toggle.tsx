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
import { useTranslation } from "@plane/i18n";
import { ToggleSwitch } from "@plane/ui";
import { useUserProfile } from "@/hooks/store/user";
import type { PreferenceOption } from "./config";
import { PreferencesSection } from "./section";

export const SmoothCursorToggle = observer(function SmoothCursorToggle(props: { option: PreferenceOption }) {
  const {
    data: { is_smooth_cursor_enabled },
    updateUserProfile,
  } = useUserProfile();
  const { t } = useTranslation();

  return (
    <PreferencesSection
      title={t(props.option.title)}
      description={t(props.option.description)}
      control={
        <div className="flex items-center justify-start sm:justify-end">
          <ToggleSwitch
            value={is_smooth_cursor_enabled}
            onChange={(value) => {
              updateUserProfile({ is_smooth_cursor_enabled: value });
            }}
            label={"smooth-cursor-toggle"}
            size={"sm"}
          />
        </div>
      }
    />
  );
});
