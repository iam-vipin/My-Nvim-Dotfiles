import type { TDescription } from "./common";

export type TMilestoneProgress = {
  total_items: number;
  completed_items: number;
  cancelled_items: number;
};

export interface TMilestone {
  id: string;
  title: string;
  description?: TDescription;
  target_date: string | null;
  project_id: string;
  workspace_id: string;
  created_by: string | null;
  updated_by: string | null;
  progress: TMilestoneProgress;
}

export interface IMilestoneInstance {
  // observables
  id: string;
  title: string;
  description?: TDescription;
  target_date: string | null;
  project_id: string;
  workspace_id: string;
  progress: TMilestoneProgress;
  work_item_ids: string[];
  // computed
  progress_percentage: number;
  // actions
  updateProgress: (progress: TMilestoneProgress) => void;
  update: (data: Partial<TMilestone>) => void;
}