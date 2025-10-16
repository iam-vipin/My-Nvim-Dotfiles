import { AppError } from "@/lib/errors";
import { PageService } from "./extended.service";

interface WorkspacePageServiceParams {
  workspaceSlug: string | null;
  cookie: string | null;
}

export class WorkspacePageService extends PageService {
  protected basePath: string;

  constructor(params: WorkspacePageServiceParams) {
    super();
    const { workspaceSlug } = params;
    if (!workspaceSlug) throw new AppError("Missing required fields.");
    // validate cookie
    if (!params.cookie) throw new AppError("Cookie is required.");
    // set cookie
    this.setHeader("Cookie", params.cookie);
    // set base path
    this.basePath = `/api/workspaces/${workspaceSlug}`;
  }
}
