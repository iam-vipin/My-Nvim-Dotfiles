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
// api service
import { APIService } from "../api.service";
import type { TProrationPreview } from "@plane/types";

/**
 * Service class for managing instance license operations
 * Handles license activation, deactivation, and sync for instance-level licensing
 * @extends {APIService}
 */
class InstanceManagementService extends APIService {
  /**
   * Creates an instance of InstanceManagementService
   * Initializes the service with the base API URL
   */
  constructor() {
    super(API_BASE_URL);
  }

  /**
   * Gets the instance license
   * @returns {Promise<any>} Promise resolving to instance license response
   * @throws {Error} If the API request fails
   */
  async getInstanceLicense(): Promise<any> {
    return this.get("/api/payments/instances/admin/licenses/enterprise/current-plan/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Activates instance license using license key
   * @param {string} licenseKey The license key to activate
   * @returns {Promise<any>} Promise resolving to activation response
   * @throws {Error} If the API request fails
   */
  async activateUsingLicenseKey(licenseKey: string): Promise<any> {
    return this.post("/api/payments/instances/admin/licenses/enterprise/activate/", {
      license_key: licenseKey,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Activates instance license using license file
   * @param {File} file The license file to upload
   * @returns {Promise<any>} Promise resolving to activation response
   * @throws {Error} If the API request fails
   */
  async activateUsingLicenseFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("license_file", file);

    return this.post("/api/payments/instances/admin/licenses/enterprise/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Deactivates instance license
   * @returns {Promise<any>} Promise resolving to deactivation response
   * @throws {Error} If the API request fails
   */
  async deactivateLicense(): Promise<any> {
    return this.post("/api/payments/instances/admin/licenses/enterprise/deactivate/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Syncs instance license with payment server
   * @returns {Promise<any>} Promise resolving to sync response
   * @throws {Error} If the API request fails
   */
  async syncLicense(): Promise<any> {
    return this.post("/api/payments/instances/admin/licenses/enterprise/sync/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Gets the enterprise subscription portal
   * @returns {Promise<any>} Promise resolving to enterprise subscription portal response
   * @throws {Error} If the API request fails
   */
  async getEnterpriseSubscriptionPortal(): Promise<any> {
    return this.get("/api/payments/instances/admin/licenses/enterprise/subscription-portal/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Gets the enterprise license proration preview
   * @param {number} quantity The number of seats to preview
   * @returns {Promise<TProrationPreview>} Promise resolving to proration preview response
   * @throws {Error} If the API request fails
   */
  async getEnterpriseLicenseProrationPreview(quantity: number): Promise<TProrationPreview> {
    return this.post("/api/payments/instances/admin/licenses/enterprise/subscription-proration-preview/", {
      quantity,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Modifies the seats for the enterprise license
   * @param {number} quantity The number of seats to modify
   * @returns {Promise<any>} Promise resolving to modification response
   * @throws {Error} If the API request fails
   */
  async modifyEnterpriseLicenseSeats(quantity: number): Promise<{ seats: number }> {
    return this.post("/api/payments/instances/admin/licenses/enterprise/modify-seats/", {
      quantity,
    })
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  /**
   * Removes unused seats for the enterprise license
   * @returns {Promise<any>} Promise resolving to removal response
   * @throws {Error} If the API request fails
   */
  async removeEnterpriseLicenseUnusedSeats(): Promise<{ seats: number }> {
    return this.post("/api/payments/instances/admin/licenses/enterprise/remove-unused-seats/")
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}

export const instanceManagementService = new InstanceManagementService();
