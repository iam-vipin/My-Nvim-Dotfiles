import { CircleChevronDown, MessageCircle } from "lucide-react";
// plane imports
import type { TAutomationActionHandlerIconKey } from "@plane/constants";

type Props = {
  iconKey: TAutomationActionHandlerIconKey;
};

const COMMON_ICON_CLASSNAME = "size-3.5 flex-shrink-0";

export function AutomationActionHandlerIcon(props: Props) {
  switch (props.iconKey) {
    case "message-circle":
      return <MessageCircle className={COMMON_ICON_CLASSNAME} />;
    case "circle-chevron-down":
      return <CircleChevronDown className={COMMON_ICON_CLASSNAME} />;
    default:
      return null;
  }
}
