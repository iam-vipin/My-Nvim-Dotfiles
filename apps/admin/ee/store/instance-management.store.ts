import { action, computed, makeObservable, observable, runInAction } from "mobx";
// plane internal packages
import { instanceManagementService } from "@plane/services";
import type { TInstanceEnterpriseSubscription } from "@plane/types";
// root store
import type { RootStore } from "@/plane-admin/store/root.store";

type TUpdateInstanceSubscriptionDetailPayload = Partial<Omit<TInstanceEnterpriseSubscription, "product">>;

export interface IInstanceManagementStore {
  // observables
  instanceLicense: TInstanceEnterpriseSubscription | null;
  // computed
  isInstanceSubscriptionManagementEnabled: boolean;
  // helper actions
  updateInstanceSubscriptionDetail: (payload: TUpdateInstanceSubscriptionDetailPayload) => void;
  // actions
  fetchInstanceLicense: () => Promise<void>;
  activateUsingLicenseKey: (licenseKey: string) => Promise<void>;
  activateUsingLicenseFile: (file: File) => Promise<void>;
  deactivateLicense: () => Promise<void>;
  syncLicense: () => Promise<void>;
}

export class InstanceManagementStore implements IInstanceManagementStore {
  // observables
  instanceLicense: TInstanceEnterpriseSubscription | null = null;

  constructor(private rootStore: RootStore) {
    makeObservable(this, {
      // observables
      instanceLicense: observable,
      // computed
      isInstanceSubscriptionManagementEnabled: computed,
      // actions
      activateUsingLicenseKey: action,
      activateUsingLicenseFile: action,
      deactivateLicense: action,
      syncLicense: action,
    });
  }

  /**
   * Get the subscription management enabled for the instance
   * @returns boolean
   */
  get isInstanceSubscriptionManagementEnabled() {
    if (!this.instanceLicense) return false;
    if (this.instanceLicense.is_offline_payment || this.rootStore.instance.config?.is_airgapped) return false;
    return true;
  }

  /**
   * Updates the instance subscription detail
   * @param {Partial<TInstanceEnterpriseSubscription>} payload The payload to update the instance subscription detail
   */
  updateInstanceSubscriptionDetail: IInstanceManagementStore["updateInstanceSubscriptionDetail"] = (payload) => {
    runInAction(() => {
      if (this.instanceLicense) {
        this.instanceLicense = { ...this.instanceLicense, ...payload };
      } else {
        console.error("instanceManagementStore -> updateInstanceSubscriptionDetail -> No instance license found");
      }
    });
  };

  /**
   * Fetches the instance license
   * @returns {Promise<TInstanceEnterpriseSubscription>} Promise resolving to instance license response
   * @throws {Error} If the API request fails
   */
  fetchInstanceLicense: IInstanceManagementStore["fetchInstanceLicense"] = async () => {
    try {
      const instanceLicense = await instanceManagementService.getInstanceLicense();
      if (instanceLicense) {
        runInAction(() => {
          this.instanceLicense = instanceLicense;
        });
      }
    } catch (error) {
      console.error("instanceManagementStore -> fetchInstanceLicense -> error", error);
      runInAction(() => {
        this.instanceLicense = null;
      });
      throw error;
    }
  };

  private processLicenseActivation = async () => {
    await Promise.all([this.fetchInstanceLicense(), this.rootStore.instanceFeatureFlags.fetchInstanceFeatureFlags()]);
  };

  /**
   * Activates instance license using license key
   * @param {string} licenseKey The license key to activate
   * @returns {Promise<void>} Promise resolving to activation response
   */
  activateUsingLicenseKey: IInstanceManagementStore["activateUsingLicenseKey"] = async (licenseKey: string) => {
    try {
      await instanceManagementService.activateUsingLicenseKey(licenseKey);
      await this.processLicenseActivation();
    } catch (error) {
      console.error("instanceManagementStore -> activateUsingLicenseKey -> error", error);
      throw error;
    }
  };

  /**
   * Activates instance license using license file
   * @param {File} file The license file to upload
   * @returns {Promise<void>} Promise resolving to activation response
   */
  activateUsingLicenseFile: IInstanceManagementStore["activateUsingLicenseFile"] = async (file: File) => {
    try {
      await instanceManagementService.activateUsingLicenseFile(file);
      await this.processLicenseActivation();
    } catch (error) {
      console.error("instanceManagementStore -> activateUsingLicenseFile -> error", error);
      throw error;
    }
  };

  /**
   * Deactivates instance license
   * @returns {Promise<void>} Promise resolving to deactivation response
   */
  deactivateLicense = async (): Promise<void> => {
    try {
      await instanceManagementService.deactivateLicense();
      // fetch instance license
      await this.fetchInstanceLicense();
      // remove feature flags
      this.rootStore.instanceFeatureFlags.flags = {};
    } catch (error) {
      console.error("instanceManagementStore -> deactivateLicense -> error", error);
      throw error;
    }
  };

  /**
   * Syncs instance license with payment server
   * @returns {Promise<void>} Promise resolving to sync response
   */
  syncLicense: IInstanceManagementStore["syncLicense"] = async () => {
    try {
      await instanceManagementService.syncLicense();
      await Promise.all([this.fetchInstanceLicense(), this.rootStore.instanceFeatureFlags.fetchInstanceFeatureFlags()]);
    } catch (error) {
      console.error("instanceManagementStore -> syncLicense -> error", error);
      throw error;
    }
  };
}
