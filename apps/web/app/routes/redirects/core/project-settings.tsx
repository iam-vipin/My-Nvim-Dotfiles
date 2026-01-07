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
import type { Route } from "./+types/project-settings";

export const clientLoader = ({ params }: Route.ClientLoaderArgs) => {
  const { workspaceSlug, projectId } = params;
  const splat = params["*"] || "";
  const destination = `/${workspaceSlug}/settings/projects/${projectId}${splat ? `/${splat}` : ""}/`;
  throw redirect(destination);
};

export default function ProjectSettings() {
  return null;
}
