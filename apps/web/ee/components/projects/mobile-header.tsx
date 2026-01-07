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

import { observer } from "mobx-react";
import { useParams, usePathname } from "next/navigation";
import { ChevronDownIcon } from "@plane/propel/icons";
// hooks
import { useWorkspace } from "@/hooks/store/use-workspace";
// plane web imports
import { useProjectFilter } from "@/plane-web/hooks/store";
// local imports
import { ProjectScopeDropdown } from "./dropdowns/scope-dropdown";
import { ProjectAttributesDropdown } from "./header/attributes-dropdown/root";
import { ProjectDisplayFiltersDropdown } from "./header/display-filters-dropdown/root";
import { ProjectLayoutSelection } from "./header/layout-selection";

export const ProjectsListMobileHeader = observer(function ProjectsListMobileHeader() {
  // router
  const { workspaceSlug } = useParams();
  const { currentWorkspace } = useWorkspace();
  const pathname = usePathname();
  const { filters } = useProjectFilter();

  const workspaceId = currentWorkspace?.id || undefined;
  const isArchived = pathname.includes("/archives");
  const selectedScope = filters?.scope;

  const customButton = (label: string) => (
    <div className="flex text-13 items-center gap-2 text-secondary">
      {label}
      <ChevronDownIcon className="h-3 w-3" strokeWidth={2} />
    </div>
  );
  if (!workspaceId || !workspaceSlug) return null;
  return (
    <div className="flex py-2 border-b border-subtle-1 md:hidden bg-surface-1 w-full">
      {!isArchived && (
        <div className="border-l border-subtle-1 flex justify-around w-full">
          <ProjectLayoutSelection workspaceSlug={workspaceSlug.toString()} />
        </div>
      )}
      {!isArchived && selectedScope && (
        <div className="border-l border-subtle-1 flex justify-around w-full">
          <ProjectScopeDropdown workspaceSlug={workspaceSlug.toString()} className={"border-none"} />
        </div>
      )}
      <div className="border-l border-subtle-1 flex justify-around w-full">
        <ProjectAttributesDropdown
          workspaceSlug={workspaceSlug.toString()}
          workspaceId={workspaceId}
          menuButton={customButton("Filters")}
          isArchived={isArchived}
        />
      </div>
      <div className="border-l border-subtle-1 flex justify-around w-full">
        <ProjectDisplayFiltersDropdown
          workspaceSlug={workspaceSlug.toString()}
          menuButton={customButton("Display")}
          isArchived={isArchived}
        />
      </div>
    </div>
  );
});
