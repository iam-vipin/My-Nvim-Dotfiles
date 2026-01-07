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

// type
import { API_BASE_URL } from "@plane/constants";
import type { ICycle } from "@plane/types";
// helpers
// services
import { APIService } from "@/services/api.service";

export class CycleArchiveService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getArchivedCycles(workspaceSlug: string, projectId: string): Promise<ICycle[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/archived-cycles/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getArchivedCycleDetails(workspaceSlug: string, projectId: string, cycleId: string): Promise<ICycle> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/archived-cycles/${cycleId}/`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async archiveCycle(
    workspaceSlug: string,
    projectId: string,
    cycleId: string
  ): Promise<{
    archived_at: string;
  }> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/archive/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async restoreCycle(workspaceSlug: string, projectId: string, cycleId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/archive/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
