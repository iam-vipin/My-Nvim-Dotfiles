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

import type { TWorkspaceConnection, TWorkspaceEntityConnection } from "../workspace";

// slack entity connection config
export type TSlackEntityConnectionConfig = object;

// slack workspace connection config
export type TSlackWorkspaceConnectionConfig = object;

// slack workspace connection data
export type TSlackWorkspaceConnectionData = {
  id: string;
  name: string;
};

// slack workspace connection
export type TSlackWorkspaceConnection = TWorkspaceConnection<
  TSlackWorkspaceConnectionConfig,
  TSlackWorkspaceConnectionData
>;

// slack entity connection
export type TSlackEntityConnection = TWorkspaceEntityConnection<TSlackEntityConnectionConfig>;
