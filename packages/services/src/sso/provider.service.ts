// plane imports
import { API_BASE_URL } from "@plane/constants";
import type {
  TCreateOIDCProviderRequest,
  TCreateSAMLProviderRequest,
  TIdentityProvider,
  TUpdateProviderRequest,
} from "@plane/types";
// local imports
import { APIService } from "../api.service";

/**
 * Service class for managing SSO identity providers
 * Handles operations related to OIDC and SAML provider configuration
 * @extends {APIService}
 */
export class SSOProviderService extends APIService {
  /**
   * Creates an instance of SSOProviderService
   * @param {string} baseUrl - The base URL for API requests (optional)
   */
  constructor(baseUrl?: string) {
    super(baseUrl || API_BASE_URL);
  }

  /**
   * Retrieves all identity providers for a specific workspace
   * @param {string} workspaceSlug - The unique slug identifier for the workspace
   * @returns {Promise<TIdentityProvider[]>} Promise resolving to array of providers
   * @throws {Error} If the API request fails
   */
  async list(workspaceSlug: string): Promise<TIdentityProvider[]> {
    return this.get(`/auth/sso/workspaces/${workspaceSlug}/providers/`).then((response) => response.data);
  }

  /**
   * Retrieves detailed information about a specific provider
   * @param {string} workspaceSlug - The unique slug identifier for the workspace
   * @param {string} providerId - The unique identifier for the provider
   * @returns {Promise<TIdentityProvider>} Promise resolving to provider details
   * @throws {Error} If the API request fails
   */
  async retrieve(workspaceSlug: string, providerId: string): Promise<TIdentityProvider> {
    return this.get(`/auth/sso/workspaces/${workspaceSlug}/providers/${providerId}/`).then((response) => response.data);
  }

  /**
   * Creates a new identity provider within a workspace
   * @param {string} workspaceSlug - The unique slug identifier for the workspace
   * @param {TCreateOIDCProviderRequest | TCreateSAMLProviderRequest} data - Provider data to create
   * @returns {Promise<TIdentityProvider>} Promise resolving to the created provider data
   * @throws {Error} If the API request fails
   */
  async create(
    workspaceSlug: string,
    data: TCreateOIDCProviderRequest | TCreateSAMLProviderRequest
  ): Promise<TIdentityProvider> {
    return this.post(`/auth/sso/workspaces/${workspaceSlug}/providers/`, data).then((response) => response.data);
  }

  /**
   * Updates an existing identity provider
   * @param {string} workspaceSlug - The unique slug identifier for the workspace
   * @param {string} providerId - The unique identifier for the provider to update
   * @param {TUpdateProviderRequest} data - Partial provider data to update
   * @returns {Promise<TIdentityProvider>} Promise resolving to the updated provider data
   * @throws {Error} If the API request fails
   */
  async update(workspaceSlug: string, providerId: string, data: TUpdateProviderRequest): Promise<TIdentityProvider> {
    return this.patch(`/auth/sso/workspaces/${workspaceSlug}/providers/${providerId}/`, data).then(
      (response) => response.data
    );
  }

  /**
   * Removes an identity provider from a workspace
   * @param {string} workspaceSlug - The unique slug identifier for the workspace
   * @param {string} providerId - The unique identifier for the provider to delete
   * @returns {Promise<void>} Promise that resolves when deletion is complete
   * @throws {Error} If the API request fails
   */
  async destroy(workspaceSlug: string, providerId: string): Promise<void> {
    return this.delete(`/auth/sso/workspaces/${workspaceSlug}/providers/${providerId}/`).then(
      (response) => response.data
    );
  }
}

export const ssoProviderService = new SSOProviderService();
