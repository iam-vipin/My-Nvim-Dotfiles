import { DEFAULT_AUTOMATION_CONDITION_CONFIG } from "@plane/constants";
import type { TCreateConditionPayload } from "@plane/types";
import { EConditionNodeHandlerName } from "@plane/types";

type TGenerateConditionPayload = {
  triggerHandlerName?: string;
  conditionPayload?: Partial<TCreateConditionPayload>;
};

export const generateConditionPayload = ({ triggerHandlerName, conditionPayload }: TGenerateConditionPayload) => ({
  name: conditionPayload?.name ?? `Condition_${triggerHandlerName || "Unknown"}_${new Date().toISOString()}`,
  handler_name: conditionPayload?.handler_name ?? EConditionNodeHandlerName.JSON_FILTER,
  config: conditionPayload?.config ?? DEFAULT_AUTOMATION_CONDITION_CONFIG,
});
