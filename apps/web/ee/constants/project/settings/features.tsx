import { ListTodo, Mail, Timer, Users, Zap } from "lucide-react";
// plane imports
import { MilestoneIcon } from "@plane/propel/icons";
import type { TProperties } from "@/ce/constants/project/settings/features";
import {
  PROJECT_BASE_FEATURES_LIST as CE_PROJECT_BASE_FEATURES_LIST,
  PROJECT_FEATURES_LIST as CE_PROJECT_FEATURES_LIST,
} from "@/ce/constants/project/settings/features";

export type TIntakeFeatureKeys = "in_app" | "email" | "form";
export type TIntakeResponsibilityKeys = "notify_assignee";

type TProjectOtherFeatureKeys = "is_time_tracking_enabled" | "is_milestone_enabled";

export type TIntakeFeatureList = {
  [key in TIntakeFeatureKeys]: TProperties & {
    hasOptions: boolean;
    hasHyperlink?: boolean;
    canShuffle?: boolean;
    fieldName?: string;
  };
};

export type TIntakeResponsibilityList = { [key in TIntakeResponsibilityKeys]: TProperties };

export const INTAKE_FEATURES_LIST: TIntakeFeatureList = {
  in_app: {
    property: "in_app",
    title: "In-app",
    description:
      "Get new work items from Members and Guests in your workspace without disruption to your existing work items.",
    icon: <Zap className="h-4 w-4 flex-shrink-0 text-custom-text-300" />,
    isPro: false,
    isEnabled: true,
    hasOptions: false,
    key: "in_app",
  },
  email: {
    property: "email",
    title: "Email",
    description: "Collect new work items from anyone who sends an email to a Plane email address.",
    icon: <Mail className="h-4 w-4 flex-shrink-0 text-custom-text-300" />,
    isPro: false,
    isEnabled: true,
    hasOptions: true,
    hasHyperlink: false,
    canShuffle: true,
    key: "intake_email",
    fieldName: "Email ID",
  },
  form: {
    property: "form",
    title: "Forms",
    description:
      "Let folks outside your workspace create potential new work items for you via a dedicated and secure form.",
    icon: <ListTodo className="h-4 w-4 flex-shrink-0 text-custom-text-300" />,
    isPro: false,
    isEnabled: true,
    hasOptions: true,
    hasHyperlink: true,
    canShuffle: true,
    key: "intake",
    fieldName: "Default form URL",
  },
};

export const INTAKE_RESPONSIBILITY_LIST: TIntakeResponsibilityList = {
  notify_assignee: {
    property: "notify_assignee",
    title: "Notify assignees",
    description: "For a new request to intake, default assignees will be alerted via notifications",
    icon: <Users className="h-4 w-4 flex-shrink-0 text-custom-text-300" />,
    isPro: false,
    isEnabled: true,
    key: "notify_assignee",
  },
};

export const PROJECT_BASE_FEATURES_LIST = {
  ...CE_PROJECT_BASE_FEATURES_LIST,
  cycles: {
    ...CE_PROJECT_BASE_FEATURES_LIST.cycles,
    href: "/cycles",
  },
};

type TOtherFeatureList = {
  [key in TProjectOtherFeatureKeys]: TProperties;
};

export const PROJECT_OTHER_FEATURES_LIST: TOtherFeatureList = {
  is_time_tracking_enabled: {
    key: "time_tracking",
    property: "is_time_tracking_enabled",
    title: "Time Tracking",
    description: "Log time, see timesheets, and download full CSVs for your entire workspace.",
    icon: <Timer className="h-5 w-5 flex-shrink-0 text-custom-text-300" />,
    isEnabled: true,
    isPro: true,
  },
  is_milestone_enabled: {
    key: "milestones",
    property: "is_milestone_enabled",
    title: "Milestones",
    description: "Milestones provide a layer to align work items toward shared completion dates.",
    icon: <MilestoneIcon className="h-5 w-5 flex-shrink-0 text-custom-text-300" />,
    isPro: true,
    isEnabled: true,
  },
};

export const PROJECT_FEATURES_LIST = {
  ...CE_PROJECT_FEATURES_LIST,
  project_features: {
    ...CE_PROJECT_FEATURES_LIST.project_features,
    featureList: PROJECT_BASE_FEATURES_LIST,
  },
  project_others: {
    key: "work_management",
    title: "Work management",
    description: "Available only on some plans as indicated by the label next to the feature below.",
    featureList: PROJECT_OTHER_FEATURES_LIST,
  },
};

export const PROJECT_FEATURES_LIST_FOR_TEMPLATE = {
  ...PROJECT_BASE_FEATURES_LIST,
  ...PROJECT_OTHER_FEATURES_LIST,
  inbox: {
    ...PROJECT_BASE_FEATURES_LIST.inbox,
    property: "intake_view", // TODO: Remove this once the property is updated in original constant
  },
};

export type TProjectFeatureForTemplateKeys = keyof typeof PROJECT_FEATURES_LIST_FOR_TEMPLATE;
