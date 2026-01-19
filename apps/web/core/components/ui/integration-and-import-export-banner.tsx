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

import { AlertCircle } from "lucide-react";

type Props = {
  bannerName: string;
  description?: string;
};

export function IntegrationAndImportExportBanner({ bannerName, description }: Props) {
  return (
    <div className="flex items-start gap-3 border-b border-subtle py-3.5">
      <h3 className="text-18 font-medium">{bannerName}</h3>
      {description && (
        <div className="flex items-center gap-3 rounded-[10px] border border-accent-strong/75 bg-accent-primary/5 p-4 text-13 text-primary">
          <AlertCircle className="h-6 w-6 text-primary" />
          <p className="leading-5">{description}</p>
        </div>
      )}
    </div>
  );
}
