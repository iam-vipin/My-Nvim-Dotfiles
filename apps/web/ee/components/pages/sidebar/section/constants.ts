import { ArchiveIcon, Share } from "lucide-react";
import { GlobeIcon, LockIcon } from "@plane/propel/icons";
import type { SectionDetailsMap } from "./types";

// Constants for section details
export const SECTION_DETAILS: SectionDetailsMap = {
  public: {
    label: "Public",
    icon: GlobeIcon,
  },
  private: {
    label: "Private",
    icon: LockIcon,
  },
  archived: {
    label: "Archived",
    icon: ArchiveIcon,
  },
  shared: {
    label: "Shared",
    icon: Share,
  },
};
