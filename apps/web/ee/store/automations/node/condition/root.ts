// plane imports
import type {
  EAutomationNodeType,
  TAutomationConditionNodeConfig,
  TConditionNodeHandlerName,
  TAutomationConditionNode,
} from "@plane/types";
// local imports
import type { IAutomationBaseNode, TAutomationBaseNodeHelpers } from "../base";
import { AutomationBaseNode } from "../base";

export type IAutomationConditionNodeInstance = IAutomationBaseNode<
  EAutomationNodeType.CONDITION,
  TConditionNodeHandlerName,
  TAutomationConditionNodeConfig
>;

export type TAutomationConditionNodeHelpers = TAutomationBaseNodeHelpers<
  EAutomationNodeType.CONDITION,
  TConditionNodeHandlerName,
  TAutomationConditionNodeConfig
>;

export class AutomationConditionNodeInstance
  extends AutomationBaseNode<EAutomationNodeType.CONDITION, TConditionNodeHandlerName, TAutomationConditionNodeConfig>
  implements IAutomationConditionNodeInstance
{
  constructor(node: TAutomationConditionNode, helpers: TAutomationConditionNodeHelpers) {
    super(node, helpers);
  }
}
