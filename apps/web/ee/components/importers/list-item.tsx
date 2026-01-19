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

import type { FC } from "react";
import Link from "next/link";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
// plane web components
import type { ImporterProps } from "@/plane-web/components/importers";
import { useFlag } from "@/plane-web/hooks/store";
import { BetaBadge } from "../common/beta";

export type ImportersListItemProps = {
  provider: ImporterProps;
  workspaceSlug: string;
};

export function ImportersListItem(props: ImportersListItemProps) {
  const { provider, workspaceSlug } = props;

  const { t } = useTranslation();

  const isFeatureEnabled = useFlag(workspaceSlug, provider.flag);
  const importerUnderFlags = ["notion", "confluence"];

  if (!isFeatureEnabled && importerUnderFlags.includes(provider.key)) {
    return null;
  }

  return (
    <div
      key={provider.key}
      className="flex flex-col w-full md:w-[30%] justify-between gap-2 rounded-md border border-subtle bg-surface-1  px-4 py-6 flex-shrink-0 overflow-hidden"
    >
      <div className="relative h-12 w-12 flex-shrink-0 bg-layer-1 rounded-sm flex items-center justify-center">
        <img src={provider.logo} alt={`${provider.title} Logo`} className="w-full h-full object-cover" />
      </div>
      <div className="relative flex items-center gap-2">
        <h3 className="flex items-center gap-4 text-13 font-medium">{provider.title}</h3>
        {provider.beta && <BetaBadge />}
      </div>
      <p className="text-13 tracking-tight text-secondary truncate">{t(provider.i18n_description)}</p>
      <div className="flex-shrink-0">
        <Link href={`/${workspaceSlug}/settings/imports/${provider.key}`}>
          <span>
            <Button variant="secondary">{t("importers.import")}</Button>
          </span>
        </Link>
      </div>
    </div>
  );
}
