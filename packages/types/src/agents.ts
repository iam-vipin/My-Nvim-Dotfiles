export enum EAgentRunStatus {
  CREATED = "created",
  IN_PROGRESS = "in_progress",
  AWAITING = "awaiting",
  COMPLETED = "completed",
  STOPPING = "stopping",
  STOPPED = "stopped",
  FAILED = "failed",
  STALE = "stale",
}

export type TAgentRun = {
  id: string;
  agent_user: string;
  status: EAgentRunStatus;
  comment: string;
  issue: string;
};
export type TAgentRunActivityContent = {
  type: string;
  body: string;
  action?: string;
  parameters?: Record<string, unknown>;
};

export type TAgentRunActivity = {
  id: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  content: TAgentRunActivityContent;
  content_metadata: Record<string, unknown>;
  ephemeral: boolean;
  signal: string;
  signal_metadata: Record<string, unknown>;
  type: string;
  created_by: string | null;
  updated_by: string | null;
  agent_run: string;
  comment: string | null;
  actor: string;
  project: string;
  workspace: string;
};

export type TAgentRunActivitiesPaginationInfo = {
  total_count: number;
  next_cursor: string;
  prev_cursor: string;
  next_page_results: boolean;
  prev_page_results: boolean;
  count: number;
  total_pages: number;
  total_results: number;
};

export type TAgentRunActivitiesResponse = TAgentRunActivitiesPaginationInfo & {
  agent_run_status: EAgentRunStatus;
  results: TAgentRunActivity[];
};
