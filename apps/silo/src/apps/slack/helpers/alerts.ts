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

import type { TSlackUserAlertsConfig } from "@plane/etl/slack";
import type { TWorkspaceConnection } from "@plane/types";
import type { TSlackWorkspaceConnectionConfig } from "../types/types";

/*
 * The function takes the workspace connection and the plane user id
 * and returns the alert configuration for the user.
 */
export const extractSlackUserAlertsConfigFromWC = (
  workspaceConnection: TWorkspaceConnection<TSlackWorkspaceConnectionConfig>,
  planeUserId: string
): TSlackUserAlertsConfig | undefined => {
  const { config } = workspaceConnection;

  if (!config.alertsConfig) {
    return undefined;
  }

  return config.alertsConfig.dmAlerts?.[planeUserId];
};

/*
 * The function takes the workspace connection and the plane user id
 * and sets the alert configuration for the user.
 */
export const setSlackUserAlertsConfig = (
  workspaceConnection: TWorkspaceConnection<TSlackWorkspaceConnectionConfig>,
  planeUserId: string,
  userAlertsConfig: TSlackUserAlertsConfig
): TSlackWorkspaceConnectionConfig => {
  const { config } = workspaceConnection;

  if (!config.alertsConfig) {
    config.alertsConfig = { dmAlerts: {} };
  }

  if (!config.alertsConfig.dmAlerts) {
    config.alertsConfig.dmAlerts = {};
  }

  config.alertsConfig.dmAlerts[planeUserId] = userAlertsConfig;
  return config;
};
