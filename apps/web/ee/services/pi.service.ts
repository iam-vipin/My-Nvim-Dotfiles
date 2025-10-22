// plane imports
import { PI_URL } from "@plane/constants";
import type { TDuplicateIssuePayload, TDuplicateIssueResponse } from "@plane/types";
// services
import { APIService } from "@/services/api.service";

export class PIService extends APIService {
  constructor() {
    super(PI_URL);
  }

  async getDuplicateIssues(data: Partial<TDuplicateIssuePayload>): Promise<TDuplicateIssueResponse> {
    return this.post(`/api/v1/dupes/issues/`, data)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }
}
