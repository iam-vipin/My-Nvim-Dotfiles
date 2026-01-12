import { GITLAB_LABEL } from "@/helpers/constants";

const SYNC_LABEL = "plane";

export const shouldSyncGitlabToPlane = (labels: string[]): boolean =>
  labels.some((label) => label.toLowerCase() === SYNC_LABEL);

export const shouldSyncPlaneToGitlab = (labels: { name: string }[]): boolean =>
  labels.some((label) => label.name.toLowerCase() === GITLAB_LABEL);
