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

// lib
import { store } from "@/lib/store-context";

export const shouldRenderColumn = (key: string): boolean => {
  const isEstimateEnabled = store.projectRoot.project.currentProjectDetails?.estimate !== null;
  const isCustomersFeatureEnabled = store.customersStore.isCustomersFeatureEnabled;
  switch (key) {
    case "estimate":
      return isEstimateEnabled;
    case "customer_count":
      return !!isCustomersFeatureEnabled;
    case "customer_request_count":
      return !!isCustomersFeatureEnabled;
    default:
      return true;
  }
};
