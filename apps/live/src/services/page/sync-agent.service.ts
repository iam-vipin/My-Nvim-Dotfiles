import { env } from "@/env";
import { type TPageDescriptionPayload } from "./core.service";
import { PageService } from "./extended.service";

export class SyncAgentPageService extends PageService {
  protected basePath: string;

  constructor() {
    super();
    // validate cookie
    if (!env.LIVE_SERVER_SECRET_KEY) throw new Error("live server secret key is required.");
    // set secret key
    this.setHeader("live-server-secret-key", env.LIVE_SERVER_SECRET_KEY);
    // set base path
    this.basePath = `/api`;
  }

  async updateDescriptionBinary(pageId: string, data: TPageDescriptionPayload): Promise<any> {
    // no op
    // since we can't prevent hocuspocus from updating the description after a
    // sync event, we need to manually override the method to not do anything
  }
}
