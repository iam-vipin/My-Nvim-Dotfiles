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

import { useTheme } from "next-themes";
// plane imports
import { useTranslation } from "@plane/i18n";
// components
import { DetailedEmptyState } from "@/components/empty-state/detailed-empty-state-root";

type TEstimateEmptyScreen = {
  onButtonClick: () => void;
};

export function EstimateEmptyScreen(props: TEstimateEmptyScreen) {
  // props
  const { onButtonClick } = props;
  const { resolvedTheme } = useTheme();

  const { t } = useTranslation();

  const resolvedPath = `/empty-state/project-settings/estimates-${resolvedTheme === "light" ? "light" : "dark"}.png`;
  return (
    <DetailedEmptyState
      title={""}
      description={""}
      assetPath={resolvedPath}
      className="w-full p-0!"
      primaryButton={{
        text: t("project_settings.empty_state.estimates.primary_button"),
        onClick: () => {
          onButtonClick();
        },
      }}
    />
  );
}
