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

// components
import { CyclesListItem } from "./cycles-list-item";

type Props = {
  cycleIds: string[];
  projectId: string;
  workspaceSlug: string;
};

export function CyclesListMap(props: Props) {
  const { cycleIds, projectId, workspaceSlug } = props;

  return (
    <>
      {cycleIds.map((cycleId) => (
        <CyclesListItem key={cycleId} cycleId={cycleId} workspaceSlug={workspaceSlug} projectId={projectId} />
      ))}
    </>
  );
}
