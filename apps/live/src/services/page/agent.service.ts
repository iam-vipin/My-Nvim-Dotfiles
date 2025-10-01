import { env } from "@/env";
import { PageService } from "./extended.service";

export class AgentPageService extends PageService {
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
}
