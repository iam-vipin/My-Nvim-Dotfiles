import type { LucideIcon } from "lucide-react";
import { CircleChevronDown, ToggleLeft, UsersRound, Hash, AlignLeft } from "lucide-react";
import type { ISvgIcons } from "@plane/propel/icons";
// plane imports
import { CalendarLayoutIcon, LinkIcon } from "@plane/propel/icons";
import type { TIssuePropertyTypeIconKey } from "@plane/types";
import { cn } from "@plane/utils";

export const CUSTOM_PROPERTY_ICON_MAP: Record<TIssuePropertyTypeIconKey, LucideIcon | React.FC<ISvgIcons>> = {
  AlignLeft: AlignLeft,
  Hash: Hash,
  CircleChevronDown: CircleChevronDown,
  ToggleLeft: ToggleLeft,
  Calendar: CalendarLayoutIcon,
  UsersRound: UsersRound,
  Link2: LinkIcon,
};

type TPropertyTypeIconProps = {
  iconKey: TIssuePropertyTypeIconKey;
  className?: string;
};

export function PropertyTypeIcon({ iconKey, className }: TPropertyTypeIconProps) {
  const Icon = CUSTOM_PROPERTY_ICON_MAP[iconKey];
  return <Icon className={cn("size-3 text-secondary", className)} />;
}
