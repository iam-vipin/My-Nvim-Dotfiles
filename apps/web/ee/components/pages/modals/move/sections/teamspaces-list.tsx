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

import { useMemo } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// components
import { Logo } from "@plane/propel/emoji-icon-picker";
// plane web imports
import { useTeamspaces } from "@/plane-web/hooks/store";
// local imports
import { MovePageModalListSection } from "../list-section";
import type { TMovePageSelectedValue } from "../root";

type Props = {
  searchTerm: string;
};

export const MovePageModalTeamspacesListSection = observer(function MovePageModalTeamspacesListSection(props: Props) {
  const { searchTerm } = props;
  // navigation
  const { teamspaceId } = useParams();
  // store hooks
  const { getTeamspaceById, joinedTeamSpaceIds } = useTeamspaces();
  // derived values
  const currentTeamspace = teamspaceId ? getTeamspaceById(teamspaceId.toString()) : null;
  const transferrableTeamspaceIds = useMemo(
    () => joinedTeamSpaceIds.filter((id) => id !== currentTeamspace?.id),
    [currentTeamspace, joinedTeamSpaceIds]
  );
  const filteredTeamspaceIds = useMemo(
    () =>
      transferrableTeamspaceIds.filter((id) => {
        const teamspaceDetails = getTeamspaceById(id);
        const teamspaceQuery = `${teamspaceDetails?.name}`.toLowerCase();
        return teamspaceQuery.includes(searchTerm.toLowerCase());
      }),
    [getTeamspaceById, searchTerm, transferrableTeamspaceIds]
  );

  if (filteredTeamspaceIds.length === 0) return null;

  return (
    <MovePageModalListSection
      title="TEAMSPACES"
      items={filteredTeamspaceIds}
      getItemDetails={(id) => {
        const teamspaceDetails = getTeamspaceById(id);
        if (!teamspaceDetails) return null;
        return {
          logo: <Logo logo={teamspaceDetails.logo_props} size={16} />,
          name: teamspaceDetails.name,
          value: `teamspace-${id}` satisfies TMovePageSelectedValue,
        };
      }}
    />
  );
});
