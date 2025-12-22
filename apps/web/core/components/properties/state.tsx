import { EIconSize } from "@plane/constants";
import { StateGroupIcon } from "@plane/propel/icons";
import type { TStateGroups } from "@plane/types";
import { cn } from "@plane/ui";
import { addSpaceIfCamelCase } from "@plane/utils";

export function DisplayState(props: {
  className?: string;
  state: {
    group?: TStateGroups;
    color?: string;
    name: string;
  };
  iconSize?: EIconSize;
}) {
  const { state, className, iconSize } = props;
  return (
    <div className={cn("flex items-center gap-1 text-13 text-tertiary", className)}>
      {state.group && (
        <StateGroupIcon stateGroup={state?.group ?? "backlog"} color={state?.color} size={iconSize ?? EIconSize.LG} />
      )}
      <div>{addSpaceIfCamelCase(state?.name ?? "")}</div>
    </div>
  );
}
