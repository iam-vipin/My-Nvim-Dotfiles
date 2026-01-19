/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

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
