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

import type { AxiosInstance } from "axios";
import axios from "axios";
import type { TWorkspaceUserConnection } from "@plane/types";

export class ConnectionService {
  public axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({ baseURL, withCredentials: true });
  }

  async getUserConnections(workspaceId: string, userId: string): Promise<TWorkspaceUserConnection[]> {
    try {
      const connections = await this.axiosInstance.get(`/api/connections/${workspaceId}/user/${userId}`);
      return connections.data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
