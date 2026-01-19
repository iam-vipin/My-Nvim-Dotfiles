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
import type { CompactAssetType } from "@plane/propel/empty-state";

const getDisplayContent = (type: string): { assetKey: CompactAssetType; text: string } => {
  switch (type) {
    case "project":
      return {
        assetKey: "project",
        text: "home.recents.empty.project",
      };
    case "page":
      return {
        assetKey: "note",
        text: "home.recents.empty.page",
      };
    case "issue":
      return {
        assetKey: "work-item",
        text: "home.recents.empty.issue",
      };
    default:
      return {
        assetKey: "work-item",
        text: "home.recents.empty.default",
      };
  }
};

export function RecentsEmptyState({ type }: { type: string }) {
  const { t } = useTranslation();

  const { assetKey, text } = getDisplayContent(type);

  return (
    <div className="flex items-center justify-center py-10 bg-layer-1 w-full rounded-lg">
      <EmptyStateCompact assetKey={assetKey} assetClassName="size-20" title={t(text)} />
    </div>
  );
}
