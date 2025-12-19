import type { AxiosInstance } from "axios";
import axios from "axios";
import { SILO_BASE_PATH, SILO_BASE_URL } from "@plane/constants";
import type { E_INTEGRATION_KEYS } from "@plane/types";

export class SiloAppService {
  protected baseURL: string;
  private axiosInstance: AxiosInstance;

  constructor() {
    this.baseURL = encodeURI(SILO_BASE_URL + SILO_BASE_PATH);
    this.axiosInstance = axios.create({ baseURL: this.baseURL, withCredentials: true });
  }

  async getSupportedIntegrations(): Promise<E_INTEGRATION_KEYS[]> {
    return this.axiosInstance
      .get(`/api/supported-integrations/`)
      .then((res) => res.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
  async getEnabledIntegrations(workspaceId: string) {
    return this.axiosInstance
      .get(`/api/apps/${workspaceId}/enabled-integrations/`)
      .then((res) => res.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
