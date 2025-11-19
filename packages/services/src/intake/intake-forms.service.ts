import { API_BASE_URL } from "@plane/constants";
import type { TIntakeTypeForm } from "@plane/types";
import { APIService } from "../api.service";

export class IntakeFormsService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  async list(workspaceSlug: string, projectId: string, params = {}): Promise<TIntakeTypeForm[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/intake-forms/`, {
      params,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async create(workspaceSlug: string, projectId: string, data: Partial<TIntakeTypeForm>): Promise<TIntakeTypeForm> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/intake-forms/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async update(
    workspaceSlug: string,
    projectId: string,
    intakeFormId: string,
    data: Partial<TIntakeTypeForm>
  ): Promise<TIntakeTypeForm> {
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/intake-forms/${intakeFormId}/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async destroy(workspaceSlug: string, projectId: string, intakeFormId: string) {
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/intake-forms/${intakeFormId}/`).catch(
      (error) => {
        throw error.response?.data;
      }
    );
  }

  /**
   * Regenerates an intake form anchor.
   */
  async regenerateFormAnchor(
    workspaceSlug: string,
    projectId: string,
    intakeFormId: string
  ): Promise<{ anchor: string }> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/intake-forms/${intakeFormId}/regenerate/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
