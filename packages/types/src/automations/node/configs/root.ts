import type { TAutomationActionNodeConfig } from "./action";
import type { TAutomationConditionNodeConfig } from "./condition";
import type { TAutomationTriggerNodeConfig } from "./trigger";

export type TAutomationNodeConfig =
  | TAutomationTriggerNodeConfig
  | TAutomationActionNodeConfig
  | TAutomationConditionNodeConfig;
