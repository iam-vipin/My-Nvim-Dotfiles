// plane imports
import { API_BASE_URL } from "@plane/constants";
import type { TIntakeIssueForm, TIntakeFormSettingsResponse, TIntakeFormSubmitPayload } from "@plane/types";
// api service
import { APIService } from "../api.service";

/**
 * Service class for managing intake operations within plane sites application.
 * Extends APIService to handle HTTP requests to the intake-related endpoints.
 * @extends {APIService}
 * @remarks This service is only available for plane sites enterprise edition
 */
export class SitesIntakeService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * Publishes an intake form to the specified anchor.
   * @param {string} anchor - The anchor identifier
   * @param {Partial<TIntakeIssueForm>} data - The intake form data
   * @returns {Promise<TIntakeIssueForm>} The intake form data
   * @throws {Error} If the API request fails
   */
  async publishForm(anchor: string, data: Partial<TIntakeIssueForm>): Promise<TIntakeIssueForm> {
    return this.post(`/api/public/anchor/${anchor}/intake/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Fetches intake form settings for a given anchor.
   * @param {string} anchor - The anchor identifier
   * @returns {Promise<TIntakeFormSettingsResponse>} The form settings data
   * @throws {Error} If the API request fails
   */
  async fetchFormSettings(anchor: string): Promise<TIntakeFormSettingsResponse> {
    return this.get(`/api/public/anchor/${anchor}/intake/form/settings/`)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Submits a type form with user data.
   * @param {string} anchor - The anchor identifier
   * @param {Record<string, any>} data - The form submission data
   * @returns {Promise<void>}
   * @throws {Error} If the API request fails
   */
  async submitTypeForm(anchor: string, data: TIntakeFormSubmitPayload): Promise<void> {
    return this.post(`/api/public/anchor/${anchor}/intake/form/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
