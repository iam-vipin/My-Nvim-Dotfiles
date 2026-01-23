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
import { Disclosure } from "@headlessui/react";
// components
import { useTranslation } from "@plane/i18n";
import { ContentWrapper, ERowVariant } from "@plane/ui";
import { ListLayout } from "@/components/core/list";
import { ProjectActiveCycleRoot } from "@/components/cycles/active-cycles/root";
// local imports
import { CyclePeekOverview } from "../cycle-peek-overview";
import { CycleListGroupHeader } from "./cycle-list-group-header";
import { CyclesListMap } from "./cycles-list-map";

export interface ICyclesList {
  completedCycleIds: string[];
  upcomingCycleIds?: string[] | undefined;
  cycleIds: string[];
  workspaceSlug: string;
  projectId: string;
  isArchived?: boolean;
}

export const CyclesList = observer(function CyclesList(props: ICyclesList) {
  const { completedCycleIds, upcomingCycleIds, cycleIds, workspaceSlug, projectId, isArchived = false } = props;
  const { t } = useTranslation();

  return (
    <ContentWrapper variant={ERowVariant.HUGGING} className="flex-row">
      <ListLayout>
        {isArchived ? (
          <>
            <CyclesListMap cycleIds={cycleIds} projectId={projectId} workspaceSlug={workspaceSlug} />
          </>
        ) : (
          <>
            <ProjectActiveCycleRoot workspaceSlug={workspaceSlug} projectId={projectId} />
            {upcomingCycleIds && (
              <Disclosure as="div" className="flex flex-shrink-0 flex-col" defaultOpen>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="sticky top-0 z-[2] w-full flex-shrink-0 border-b border-subtle bg-layer-1 cursor-pointer">
                      <CycleListGroupHeader
                        title={t("project_cycles.upcoming_cycle.label")}
                        type="upcoming"
                        count={upcomingCycleIds.length}
                        showCount
                        isExpanded={open}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel>
                      <CyclesListMap cycleIds={upcomingCycleIds} projectId={projectId} workspaceSlug={workspaceSlug} />
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            )}
            <Disclosure as="div" className="flex flex-shrink-0 flex-col pb-7">
              {({ open }) => (
                <>
                  <Disclosure.Button className="sticky top-0 z-2 w-full flex-shrink-0 border-b border-subtle bg-layer-1 cursor-pointer">
                    <CycleListGroupHeader
                      title={t("project_cycles.completed_cycle.label")}
                      type="completed"
                      count={completedCycleIds.length}
                      showCount
                      isExpanded={open}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel>
                    <CyclesListMap cycleIds={completedCycleIds} projectId={projectId} workspaceSlug={workspaceSlug} />
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          </>
        )}
      </ListLayout>
      <CyclePeekOverview projectId={projectId} workspaceSlug={workspaceSlug} isArchived={isArchived} />
    </ContentWrapper>
  );
});
