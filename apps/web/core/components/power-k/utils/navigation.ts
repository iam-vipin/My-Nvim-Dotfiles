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

// plane imports
import { joinUrlPath } from "@plane/utils";
// local imports
import type { TPowerKContext } from "../core/types";

export const handlePowerKNavigate = (context: TPowerKContext, routerSegments: (string | undefined)[]) => {
  const validRouterSegments = routerSegments.filter((segment) => segment !== undefined);

  if (validRouterSegments.length === 0) {
    console.warn("No valid router segments provided", routerSegments);
    return;
  }

  if (validRouterSegments.length !== routerSegments.length) {
    console.warn("Some of the router segments are undefined", routerSegments);
  }

  const route = joinUrlPath(...validRouterSegments);
  context.router.push(route);
};
