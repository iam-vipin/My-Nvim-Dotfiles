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

// components
import { QuickLinksWidgetLoader } from "./quick-links";
import { RecentActivityWidgetLoader } from "./recent-activity";

// types

type Props = {
  widgetKey: EWidgetKeys;
};

export enum EWidgetKeys {
  RECENT_ACTIVITY = "recent_activity",
  QUICK_LINKS = "quick_links",
}

export function WidgetLoader(props: Props) {
  const { widgetKey } = props;

  const loaders = {
    [EWidgetKeys.RECENT_ACTIVITY]: <RecentActivityWidgetLoader />,
    [EWidgetKeys.QUICK_LINKS]: <QuickLinksWidgetLoader />,
  };

  return loaders[widgetKey];
}
