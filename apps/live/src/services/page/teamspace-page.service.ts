import { AppError } from "@/lib/errors";
import { PageService } from "./extended.service";

interface TeamspacePageServiceParams {
  workspaceSlug: string | null;
  teamspaceId: string | null;
  cookie: string | null;
  [key: string]: unknown;
}
export class TeamspacePageService extends PageService {
  protected basePath: string;

  constructor(params: TeamspacePageServiceParams) {
    super();
    const { workspaceSlug, teamspaceId } = params;
    if (!workspaceSlug || !teamspaceId) throw new AppError("Missing required fields.");
    // validate cookie
    if (!params.cookie) throw new AppError("Cookie is required.");
    // set cookie
    this.setHeader("Cookie", params.cookie);
    // set base path
    this.basePath = `/api/workspaces/${workspaceSlug}/teamspaces/${teamspaceId}`;
  }
}
