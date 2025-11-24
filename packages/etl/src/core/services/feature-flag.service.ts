import type { AxiosInstance } from "axios";
import axios from "axios";
// types
import type { TFeatureFlags } from "@/core/types";

export class FeatureFlagService {
  public axiosInstance: AxiosInstance;

  constructor(baseURL: string, config?: { x_api_key: string }) {
    this.axiosInstance = axios.create({ baseURL });
    this.axiosInstance.defaults.headers.common["x-api-key"] = config?.x_api_key;
  }

  async featureFlags(payload: { workspace_slug: string; user_id: string; flag_key: TFeatureFlags }): Promise<boolean> {
    return this.axiosInstance
      .post(`/api/feature-flags/`, payload)
      .then((response) =>
        response.data.values ? (response.data.values[payload.flag_key] ?? false) : (response.data.value ?? false)
      )
      .catch((error) => {
        console.error(`Error getting feature flag`, { payload, error: error });
        return false;
      });
  }

  async getAllFeatureFlags(payload: { workspace_slug: string; user_id: string }): Promise<Record<string, boolean>> {
    return this.axiosInstance
      .post(`/api/feature-flags/`, payload)
      .then((response) => response?.data?.values)
      .catch(() => {});
  }
}
