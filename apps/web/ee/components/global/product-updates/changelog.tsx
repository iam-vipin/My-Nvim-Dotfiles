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
// ce imports
import { ProductUpdatesChangelog as ProductUpdatesChangelogCE } from "@/ce/components/global/product-updates/changelog";
// hooks
import { ProductUpdatesFallback } from "@/components/global/product-updates/fallback";
import { useInstance } from "@/hooks/store/use-instance";

export const ProductUpdatesChangelog = observer(function ProductUpdatesChangelog() {
  // store hooks
  const { config } = useInstance();

  if (config?.is_airgapped) {
    return (
      <ProductUpdatesFallback
        description="You’re using the airgapped version of Plane. Please visit our changelog to view the latest updates."
        variant="self-managed"
      />
    );
  }

  return <ProductUpdatesChangelogCE />;
});
