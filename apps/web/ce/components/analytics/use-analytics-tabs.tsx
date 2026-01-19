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

import { useMemo } from "react";
import { useTranslation } from "@plane/i18n";
import { getAnalyticsTabs } from "./tabs";

export const useAnalyticsTabs = (workspaceSlug: string) => {
  const { t } = useTranslation();

  const analyticsTabs = useMemo(() => getAnalyticsTabs(t), [t]);

  return analyticsTabs;
};
