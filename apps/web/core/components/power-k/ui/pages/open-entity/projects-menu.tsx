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
// plane types
import type { IPartialProject } from "@plane/types";
import { Spinner } from "@plane/ui";
// components
import { PowerKProjectsMenu } from "@/components/power-k/menus/projects";
// hooks
import { useProject } from "@/hooks/store/use-project";

type Props = {
  handleSelect: (project: IPartialProject) => void;
};

export const PowerKOpenProjectMenu = observer(function PowerKOpenProjectMenu(props: Props) {
  const { handleSelect } = props;
  // store hooks
  const { loader, joinedProjectIds, getPartialProjectById } = useProject();
  // derived values
  const projectsList = joinedProjectIds
    ? joinedProjectIds.map((id) => getPartialProjectById(id)).filter((project) => project !== undefined)
    : [];

  if (loader === "init-loader") return <Spinner />;

  return <PowerKProjectsMenu projects={projectsList} onSelect={handleSelect} />;
});
