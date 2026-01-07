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

export enum EProjectPriority {
  NONE = "none",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum EProjectStateGroup {
  DRAFT = "draft",
  PLANNING = "planning",
  EXECUTION = "execution",
  MONITORING = "monitoring",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum EProjectAccess {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum EProjectStateLoader {
  INIT_LOADER = "project-state-init-loader",
  MUTATION_LOADER = "project-state-mutation-loader",
}
