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

import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, route } from "@react-router/dev/routes";

export default [
  index("./page.tsx"),
  route(":workspaceSlug/:projectId", "./[workspaceSlug]/[projectId]/page.tsx"),
  layout("./issues/[anchor]/layout.tsx", [route("issues/:anchor", "./issues/[anchor]/page.tsx")]),
  layout("./views/[anchor]/layout.tsx", [route("views/:anchor", "./views/[anchor]/page.tsx")]),
  layout("./pages/[anchor]/layout.tsx", [route("pages/:anchor", "./pages/[anchor]/page.tsx")]),
  layout("./intake/[anchor]/layout.tsx", [route("intake/:anchor", "./intake/[anchor]/page.tsx")]),
  layout("./intake/forms/[anchor]/layout.tsx", [route("intake/forms/:anchor", "./intake/forms/[anchor]/page.tsx")]),
  // Catch-all route for 404 handling
  route("*", "./not-found.tsx"),
] satisfies RouteConfig;
