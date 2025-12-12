import { MessageCircle } from "lucide-react";
import type { TAutomationTriggerIconKey } from "@plane/constants";
import { LayersIcon, MembersPropertyIcon, StatePropertyIcon } from "@plane/propel/icons";

type Props = {
  iconKey: TAutomationTriggerIconKey;
};

const COMMON_ICON_CLASSNAME = "size-3.5 flex-shrink-0";

export function AutomationTriggerIcon(props: Props) {
  switch (props.iconKey) {
    case "LayersIcon":
      return <LayersIcon className={COMMON_ICON_CLASSNAME} />;
    case "DoubleCircleIcon":
      return <StatePropertyIcon className={COMMON_ICON_CLASSNAME} />;
    case "Users":
      return <MembersPropertyIcon className={COMMON_ICON_CLASSNAME} />;
    case "MessageCircle":
      return <MessageCircle className={COMMON_ICON_CLASSNAME} />;
    default:
      return null;
  }
}
