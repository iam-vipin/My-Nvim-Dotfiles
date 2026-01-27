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
// local imports
import { NotificationFilter } from "../../filters/menu";
import { NotificationHeaderMenuOption } from "./menu-option";

type TNotificationSidebarHeaderOptions = {
  workspaceSlug: string;
};

export const NotificationSidebarHeaderOptions = observer(function NotificationSidebarHeaderOptions(
  props: TNotificationSidebarHeaderOptions
) {
  return (
    <div className="relative flex justify-center items-center gap-2 text-body-xs-medium">
      {/* notification filters */}
      <NotificationFilter />

      {/* notification menu options */}
      <NotificationHeaderMenuOption />
    </div>
  );
});
