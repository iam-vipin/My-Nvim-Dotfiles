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
import { API_BASE_URL } from "@plane/constants";
import type { TCreateDomainRequest, TDomain } from "@plane/types";
// local imports
import { APIService } from "../api.service";

/**
 * Service class for managing SSO domains
 * Handles operations related to domain verification and management for SSO
 * @extends {APIService}
 */
export class SSODomainService extends APIService {
  /**
   * Creates an instance of SSODomainService
   * @param {string} baseUrl - The base URL for API requests (optional)
   */
  constructor(baseUrl?: string) {
    super(baseUrl || API_BASE_URL);
  }

  /**
   * Retrieves all domains for a specific workspace
   * @param {string} workspaceSlug - The unique slug identifier for the workspace
   * @returns {Promise<TDomain[]>} Promise resolving to array of domains
   * @throws {Error} If the API request fails
   */
  async list(workspaceSlug: string): Promise<TDomain[]> {
    return this.get(`/auth/sso/workspaces/${workspaceSlug}/domains/`).then((response) => response.data);
  }

  /**
   * Retrieves detailed information about a specific domain
   * @param {string} workspaceSlug - The unique slug identifier for the workspace
   * @param {string} domainId - The unique identifier for the domain
   * @returns {Promise<TDomain>} Promise resolving to domain details
   * @throws {Error} If the API request fails
   */
  async retrieve(workspaceSlug: string, domainId: string): Promise<TDomain> {
    return this.get(`/auth/sso/workspaces/${workspaceSlug}/domains/${domainId}/`).then((response) => response.data);
  }

  /**
   * Creates a new domain within a workspace
   * @param {string} workspaceSlug - The unique slug identifier for the workspace
   * @param {TCreateDomainRequest} data - Domain data to create
   * @returns {Promise<TDomain>} Promise resolving to the created domain data
   * @throws {Error} If the API request fails
   */
  async create(workspaceSlug: string, data: TCreateDomainRequest): Promise<TDomain> {
    return this.post(`/auth/sso/workspaces/${workspaceSlug}/domains/`, data).then((response) => response.data);
  }

  /**
   * Verifies a domain by checking DNS TXT records
   * @param {string} workspaceSlug - The unique slug identifier for the workspace
   * @param {string} domainId - The unique identifier for the domain to verify
   * @returns {Promise<TDomain>} Promise resolving to the updated domain data with verification status
   * @throws {Error} If the API request fails
   */
  async verify(workspaceSlug: string, domainId: string): Promise<TDomain> {
    return this.post(`/auth/sso/workspaces/${workspaceSlug}/domains/${domainId}/verification/`).then(
      (response) => response.data
    );
  }

  /**
   * Removes a domain from a workspace
   * @param {string} workspaceSlug - The unique slug identifier for the workspace
   * @param {string} domainId - The unique identifier for the domain to delete
   * @returns {Promise<void>} Promise that resolves when deletion is complete
   * @throws {Error} If the API request fails
   */
  async destroy(workspaceSlug: string, domainId: string): Promise<void> {
    return this.delete(`/auth/sso/workspaces/${workspaceSlug}/domains/${domainId}/`).then((response) => response.data);
  }
}

export const ssoDomainService = new SSODomainService();
