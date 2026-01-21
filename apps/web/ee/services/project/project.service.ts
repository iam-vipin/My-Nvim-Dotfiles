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

/* eslint-disable no-useless-catch */

// plane imports
import type { TProject, TProjectLink, TStateAnalytics } from "@plane/types";
// plane web imports
import type { TProjectAttributesParams, TProjectAttributesResponse, TProjectFeatures } from "@/types";
// services
import { ProjectService as CeProjectService } from "@/services/project";

export class ProjectService extends CeProjectService {
  constructor() {
    super();
  }

  // create project using template
  async createProjectUsingTemplate(
    workspaceSlug: string,
    templateId: string,
    data: Partial<TProject>
  ): Promise<TProject> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/use-template/`, {
      template_id: templateId,
      ...data,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  // attributes
  async getProjectAttributes(
    workspaceSlug: string,
    params?: TProjectAttributesParams
  ): Promise<TProjectAttributesResponse[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/project-attributes/`, {
      params,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  // analytics
  async fetchProjectAnalytics(workspaceSlug: string, projectId: string): Promise<TStateAnalytics> {
    try {
      const { data } = await this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/analytics/`);
      return data || undefined;
    } catch (error) {
      throw error;
    }
  }

  // links
  async fetchProjectLinks(workspaceSlug: string, projectId: string): Promise<TProjectLink[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/links/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async createProjectLink(
    workspaceSlug: string,
    projectId: string,
    data: Partial<TProjectLink>
  ): Promise<TProjectLink> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/links/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async updateProjectLink(
    workspaceSlug: string,
    projectId: string,
    linkId: string,
    data: Partial<TProjectLink>
  ): Promise<TProjectLink> {
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/links/${linkId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  async deleteProjectLink(workspaceSlug: string, projectId: string, linkId: string): Promise<any> {
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/links/${linkId}/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async getProjectFeatures(workspaceSlug: string): Promise<TProjectFeatures[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/workspace-project-features/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async toggleProjectFeatures(
    workspaceSlug: string,
    projectId: string,
    data: Partial<TProjectFeatures>
  ): Promise<TProjectFeatures> {
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/features/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response;
      });
  }

  // Work item CSV import
  async importWorkItemsFromCSV(
    workspaceSlug: string,
    projectId: string,
    assetId: string
  ): Promise<{ message: string; job_id: string }> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/work-items/import/`, {
      asset_id: assetId,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

const projectService = new ProjectService();

export default projectService;
