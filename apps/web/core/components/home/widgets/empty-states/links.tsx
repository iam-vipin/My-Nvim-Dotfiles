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

import { useTranslation } from "@plane/i18n";
import { EmptyStateCompact } from "@plane/propel/empty-state";

export function LinksEmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center py-10 bg-layer-1 w-full rounded-lg">
      <EmptyStateCompact
        assetKey="link"
        assetClassName="w-20 h-20"
        title={t("workspace_empty_state.home_widget_quick_links.title")}
      />
    </div>
  );
}
