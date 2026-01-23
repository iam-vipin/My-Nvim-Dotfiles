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
import { useTheme } from "next-themes";
import { Disclosure } from "@headlessui/react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { ContentWrapper, ERowVariant } from "@plane/ui";
// assets
import currentCyclesDark from "@/app/assets/empty-state/teams/current-cycles-dark.webp?url";
import currentCyclesLight from "@/app/assets/empty-state/teams/current-cycles-light.webp?url";
// components
import { CycleListProjectGroupHeader } from "@/components/cycles/list/cycle-list-project-group-header";
import { DetailedEmptyState } from "@/components/empty-state/detailed-empty-state-root";
import { ProjectActiveCycleRoot } from "@/components/cycles/active-cycles/root";
// hooks
import { useTeamspaceCycles } from "@/plane-web/hooks/store";

type TTeamCurrentCyclesRoot = {
  teamspaceId: string;
  workspaceSlug: string;
};

export const TeamCurrentCyclesRoot = observer(function TeamCurrentCyclesRoot(props: TTeamCurrentCyclesRoot) {
  const { teamspaceId, workspaceSlug } = props;
  // plane hooks
  const { t } = useTranslation();
  // theme hook
  const { resolvedTheme } = useTheme();
  // store hooks
  const { getTeamspaceFilteredActiveCycleIds, getTeamspaceGroupedActiveCycleIds } = useTeamspaceCycles();
  // derived values
  const filteredActiveCycleIds = getTeamspaceFilteredActiveCycleIds(teamspaceId);
  const groupedActiveCycleIds = getTeamspaceGroupedActiveCycleIds(teamspaceId);
  const resolvedPath = resolvedTheme === "light" ? currentCyclesLight : currentCyclesDark;

  if (filteredActiveCycleIds.length === 0) {
    return (
      <DetailedEmptyState
        title={t("teamspace_cycles.empty_state.current.title")}
        description={t("teamspace_cycles.empty_state.current.description")}
        assetPath={resolvedPath}
      />
    );
  }

  return (
    <ContentWrapper variant={ERowVariant.HUGGING} className="relative">
      {Object.entries(groupedActiveCycleIds).map(([projectId, cycleId]) => (
        <Disclosure as="div" key={projectId} className="flex flex-shrink-0 flex-col" defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button className="sticky top-0 z-[2] w-full flex-shrink-0 border-b border-subtle-1 bg-layer-1 cursor-pointer">
                <CycleListProjectGroupHeader projectId={projectId} isExpanded={open} />
              </Disclosure.Button>
              <Disclosure.Panel>
                <ProjectActiveCycleRoot
                  workspaceSlug={workspaceSlug}
                  projectId={projectId}
                  cycleId={cycleId}
                  showHeader={false}
                />
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </ContentWrapper>
  );
});
