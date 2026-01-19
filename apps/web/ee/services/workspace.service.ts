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

// plane imports
import type {
  EViewAccess,
  IBlockUpdateDependencyData,
  ISearchIssueResponse,
  TEditorWorkItemMention,
  TWorkspaceEpicsSearchParams,
  TSearchResults,
  TWorkspaceMemberImportSummary,
} from "@plane/types";
// helpers
// services
import { WorkspaceService as CoreWorkspaceService } from "@/services/workspace.service";

export class WorkspaceService extends CoreWorkspaceService {
  constructor() {
    super();
  }

  async updateViewAccess(workspaceSlug: string, viewId: string, access: EViewAccess): Promise<any> {
    return this.post(`/api/workspaces/${workspaceSlug}/views/${viewId}/access/`, { access }).catch((error) => {
      throw error?.response?.data;
    });
  }

  async lockView(workspaceSlug: string, viewId: string): Promise<any> {
    return this.post(`/api/workspaces/${workspaceSlug}/views/${viewId}/lock/`).catch((error) => {
      throw error?.response?.data;
    });
  }

  async unLockView(workspaceSlug: string, viewId: string): Promise<any> {
    return this.delete(`/api/workspaces/${workspaceSlug}/views/${viewId}/lock/`).catch((error) => {
      throw error?.response?.data;
    });
  }

  async searchAcrossWorkspace(
    workspaceSlug: string,
    params: { search: string; workspace_search?: boolean; project_id?: string }
  ): Promise<{ results: TSearchResults }> {
    return this.get(`/api/workspaces/${workspaceSlug}/search/`, { params }).then((response) => response?.data);
  }

  /**
   * Enhanced search across workspace. This endpoint is similar to searchAcrossWorkspace
   * but it returns more detailed results for each item. It is used in the search bar.
   *
   * @param {string} workspaceSlug - The workspace slug.
   * @param {Object} params - The search params.
   * @param {string} params.search - The search string.
   * @param {boolean} [params.workspace_search=false] - If true, search in the whole workspace.
   * @param {string} [params.projectId] - The project id to search in.
   * @returns {Promise<Object[]>} - The search results.
   */
  async enhancedSearchAcrossWorkspace(
    workspaceSlug: string,
    params: { search: string; workspace_search?: boolean; projectId?: string }
  ) {
    return this.get(`/api/workspaces/${workspaceSlug}/enhanced-search/`, { params }).then((response) => response?.data);
  }

  async fetchWorkspaceEpics(
    workspaceSlug: string,
    params: TWorkspaceEpicsSearchParams
  ): Promise<ISearchIssueResponse[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/epics/`, { params }).then((response) => response?.data);
  }

  async updateWorkItemDates(workspaceSlug: string, updates: IBlockUpdateDependencyData[]): Promise<void> {
    return this.post(`/api/workspaces/${workspaceSlug}/issue-dates/`, { updates }).then((response) => response?.data);
  }

  async retrieveWorkspaceWorkItem(workspaceSlug: string, workItemId: string): Promise<TEditorWorkItemMention> {
    return this.get(`/api/workspaces/${workspaceSlug}/issues/${workItemId}/`).then((response) => response?.data);
  }

  async importMembers(workspaceSlug: string, assetId: string): Promise<TWorkspaceMemberImportSummary> {
    return this.post(`/api/workspaces/${workspaceSlug}/members-import/`, { asset_id: assetId })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
