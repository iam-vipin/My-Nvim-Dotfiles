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

import { EPageStoreType, usePageStore } from "@/ce/hooks/store/use-page-store";
import { useCycle } from "@/hooks/store/use-cycle";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useModule } from "@/hooks/store/use-module";
import { useProjectView } from "@/hooks/store/use-project-view";
import { getIcon } from "@/components/pi-chat/helper";

export const useAIAssistant = (
  entityType: "issue" | "cycle" | "module" | "page" | "view",
  entityIdentifier: string
) => {
  const { getCycleById } = useCycle();
  const { getModuleById } = useModule();
  const { getPageById } = usePageStore(EPageStoreType.PROJECT);
  const {
    issue: { getIssueById, getIssueIdByIdentifier },
  } = useIssueDetail();
  const { getViewById } = useProjectView();

  switch (entityType) {
    case "issue": {
      const [projectIdentifier, sequence_id] = entityIdentifier.split("-");
      const issueId = getIssueIdByIdentifier(entityIdentifier);
      const issue = issueId ? getIssueById(issueId) : undefined;
      if (!issue) return null;
      return {
        id: issue.id,
        type: "issues",
        title: issue.name,
        subTitle: `${projectIdentifier}-${sequence_id}`,
        icon: getIcon("issue", {
          type_id: issue.type_id,
          project_id: issue.project_id ?? "",
          project__identifier: projectIdentifier,
          sequence_id: sequence_id,
        }),
      };
    }
    case "cycle": {
      const cycle = getCycleById(entityIdentifier);
      if (!cycle) return null;
      return {
        id: entityIdentifier,
        type: "cycles",
        title: cycle.name,
        icon: getIcon("cycle"),
      };
    }
    case "module": {
      const moduleDetails = getModuleById(entityIdentifier);
      if (!moduleDetails) return null;
      return {
        id: entityIdentifier,
        type: "modules",
        title: moduleDetails.name,
        icon: getIcon("module"),
      };
    }
    case "page": {
      const pageDetails = getPageById(entityIdentifier);
      if (!pageDetails) return null;
      return {
        id: entityIdentifier,
        type: "pages",
        title: pageDetails.name,
        icon: getIcon("page"),
      };
    }
    case "view": {
      const viewDetails = getViewById(entityIdentifier);
      if (!viewDetails) return null;
      return {
        id: entityIdentifier,
        type: "views",
        title: viewDetails.name,
        icon: getIcon("view"),
      };
    }
  }
};
