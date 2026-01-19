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

import * as React from "react";

import { ModuleBacklogIcon } from "./backlog";
import { ModuleCancelledIcon } from "./cancelled";
import { ModuleCompletedIcon } from "./completed";
import { ModuleInProgressIcon } from "./in-progress";
import { ModulePausedIcon } from "./paused";
import { ModulePlannedIcon } from "./planned";

export type TModuleStatus = "backlog" | "planned" | "in-progress" | "paused" | "completed" | "cancelled";

type Props = {
  status: TModuleStatus;
  className?: string;
  height?: string;
  width?: string;
};

export function ModuleStatusIcon({ status, className, height = "12px", width = "12px" }: Props) {
  if (status === "backlog") return <ModuleBacklogIcon className={className} height={height} width={width} />;
  else if (status === "cancelled") return <ModuleCancelledIcon className={className} height={height} width={width} />;
  else if (status === "completed") return <ModuleCompletedIcon className={className} height={height} width={width} />;
  else if (status === "in-progress")
    return <ModuleInProgressIcon className={className} height={height} width={width} />;
  else if (status === "paused") return <ModulePausedIcon className={className} height={height} width={width} />;
  else return <ModulePlannedIcon className={className} height={height} width={width} />;
}
