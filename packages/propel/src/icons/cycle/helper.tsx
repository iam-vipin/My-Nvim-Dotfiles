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

export interface ICycleGroupIcon {
  className?: string;
  color?: string;
  cycleGroup: TCycleGroups;
  height?: string;
  width?: string;
}

export type TCycleGroups = "current" | "upcoming" | "completed" | "draft";

export const CYCLE_GROUP_COLORS: {
  [key in TCycleGroups]: string;
} = {
  current: "#F59E0B",
  upcoming: "#3F76FF",
  completed: "#16A34A",
  draft: "#525252",
};

export const CYCLE_GROUP_I18N_LABELS: {
  [key in TCycleGroups]: string;
} = {
  current: "current",
  upcoming: "common.upcoming",
  completed: "common.completed",
  draft: "project_cycles.status.draft",
};
