import { observer } from "mobx-react";
// plane imports
import { StateGroupIcon } from "@plane/propel/icons";
import type { TStateGroups } from "@plane/types";

type Props = {
  className?: string;
  stateColor: string;
  stateGroup: TStateGroups;
};

export const EditorWorkItemMentionLogo: React.FC<Props> = observer((props) => {
  const { className, stateColor, stateGroup } = props;

  return <StateGroupIcon stateGroup={stateGroup} color={stateColor} className={className} />;
});
