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

import { redirect } from "react-router";
import type { Route } from "./+types/workspace-account-settings";

export const clientLoader = ({ params, request }: Route.ClientLoaderArgs) => {
  const { workspaceSlug } = params;
  const searchParams = new URL(request.url).searchParams;
  const splatWithTrailingSlash = params["*"] || "";
  const resolvedSplat = splatWithTrailingSlash.endsWith("/")
    ? splatWithTrailingSlash.slice(0, -1)
    : splatWithTrailingSlash;
  if (resolvedSplat === "connections") {
    throw redirect(`/${workspaceSlug}/settings/connections/?${searchParams.toString()}`);
  } else {
    throw redirect(`/settings/profile/${resolvedSplat || "general"}/?${searchParams.toString()}`);
  }
};

export default function WorkspaceAccountSettings() {
  return null;
}
