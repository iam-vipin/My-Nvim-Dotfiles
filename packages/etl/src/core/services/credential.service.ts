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
// types
import type { TServiceAuthConfiguration, TImporterKeys } from "@/core/types";

export class CredentialService {
  public axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({ baseURL, withCredentials: true });
  }

  /**
   * @description check if the service is configured
   * @param workspaceId: string
   * @param userId: string
   * @param source: TImporterKeys
   * @returns TServiceAuthConfiguration
   */
  async isServiceConfigured(
    workspaceId: string,
    userId: string,
    source: TImporterKeys
  ): Promise<TServiceAuthConfiguration> {
    return this.axiosInstance
      .get(`/api/credentials/${workspaceId}/${userId}/?source=${source}`)
      .then((response) => response?.data)
      .catch((error) => error?.response?.data);
  }

  // TODO: Personal Access Token Service methods
}
