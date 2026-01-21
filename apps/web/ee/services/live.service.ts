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

import { LIVE_URL } from "@plane/constants";
import type { IframelyResponse, TVersionDiffResponse } from "@plane/types";
import { APIService } from "@/services/api.service";

export type TPageType = "project" | "workspace" | "teamspace";

export type TVersionDiffParams = {
  pageId: string;
  versionId: string;
  previousVersionId?: string;
  workspaceSlug: string;
  userId: string;
  pageType: TPageType;
  projectId?: string;
  teamspaceId?: string;
};

export class LiveService extends APIService {
  constructor() {
    super(LIVE_URL);
  }

  /**
   * Fetches embed data for a URL from the iframely service
   */
  async getEmbedData(
    url: string,
    isDarkTheme: boolean = false,
    workspaceSlug: string,
    userId: string
  ): Promise<IframelyResponse> {
    const response = await this.get(
      `/iframely`,
      {
        params: {
          url: url,
          _theme: isDarkTheme ? "dark" : "light",
          workspaceSlug,
          userId,
        },
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  }

  async getContent(url: string): Promise<string> {
    const response = await this.get(`/content`, {
      params: { url: url },
    });
    return response.data.content;
  }

  /**
   * Fetches precomputed version diff from live server
   * Returns diff data ready for rendering + editors list
   */
  async getVersionDiff(params: TVersionDiffParams): Promise<TVersionDiffResponse> {
    const response = await this.get(
      `/version-diff`,
      {
        params,
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
}

// Create a singleton instance
export const liveService = new LiveService();
