import type { LucideIcon } from "lucide-react";
import { Calendar, CircleChevronDown, ToggleLeft, UsersRound, Hash, AlignLeft, Link2 } from "lucide-react";
// plane imports
import type { TIssuePropertyTypeIconKey } from "@plane/types";
import { cn } from "@plane/utils";

export const CUSTOM_PROPERTY_ICON_MAP: Record<TIssuePropertyTypeIconKey, LucideIcon> = {
  AlignLeft: AlignLeft,
  Hash: Hash,
  CircleChevronDown: CircleChevronDown,
  ToggleLeft: ToggleLeft,
  Calendar: Calendar,
  UsersRound: UsersRound,
  Link2: Link2,
};

type TPropertyTypeIconProps = {
  iconKey: TIssuePropertyTypeIconKey;
  className?: string;
};

export const PropertyTypeIcon = ({ iconKey, className }: TPropertyTypeIconProps) => {
  const Icon = CUSTOM_PROPERTY_ICON_MAP[iconKey];
  return <Icon className={cn("size-3 text-custom-text-200", className)} />;
};
