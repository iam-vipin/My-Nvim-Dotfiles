import type { TActionNodeHandlerName } from "./action";
import type { TConditionNodeHandlerName } from "./condition";
import type { TTriggerNodeHandlerName } from "./trigger";

export type TAutomationNodeHandlerName = TTriggerNodeHandlerName | TConditionNodeHandlerName | TActionNodeHandlerName;
