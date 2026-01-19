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

import { Download, File } from "lucide-react";
// plane imports
import { ADDITIONAL_EXTENSIONS } from "@plane/editor";
import { useTranslation } from "@plane/i18n";
// ce imports
import type { TAdditionalPageNavigationPaneAssetItemProps } from "@/ce/components/pages/navigation-pane/tab-panels/assets";

export function AdditionalPageNavigationPaneAssetItem(props: TAdditionalPageNavigationPaneAssetItemProps) {
  const { asset, assetSrc, assetDownloadSrc } = props;
  // translation
  const { t } = useTranslation();

  if (asset.type === ADDITIONAL_EXTENSIONS.ATTACHMENT) {
    return (
      <a
        href={asset.href}
        className="relative group/asset-item h-12 flex items-center gap-2 pr-2 rounded-sm border border-subtle-1 hover:bg-layer-1 transition-colors"
      >
        <div className="flex-shrink-0 w-11 h-12 rounded-l grid place-items-center">
          <File className="size-6 text-tertiary" />
        </div>
        <div className="flex-1 space-y-0.5 truncate">
          <p className="text-13 font-medium truncate">{asset.name}</p>
          <div className="flex items-end justify-between gap-2">
            <p className="shrink-0 text-11 text-secondary" />
            <a
              href={assetDownloadSrc}
              target="_blank"
              rel="noreferrer noopener"
              className="shrink-0 py-0.5 px-1 flex items-center gap-1 rounded-sm text-secondary hover:text-primary opacity-0 pointer-events-none group-hover/asset-item:opacity-100 group-hover/asset-item:pointer-events-auto transition-opacity"
            >
              <Download className="shrink-0 size-3" />
              <span className="text-11 font-medium">{t("page_navigation_pane.tabs.assets.download_button")}</span>
            </a>
          </div>
        </div>
      </a>
    );
  }

  return null;
}
