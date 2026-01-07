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

import { useState } from "react";
import { observer } from "mobx-react";
// Plane
import { useTranslation } from "@plane/i18n";
import type { TInitiativeGroupByOptions } from "@plane/types";
import { Row } from "@plane/ui";
import { cn } from "@plane/utils";

// local imports
import type { TInitiativeGroup } from "../utils";
import { GroupHeader } from "./group-header";
import { InitiativeBlock } from "./initiative-block";

type Props = {
  group: TInitiativeGroup;
  initiativesIds: string[];
  groupBy: TInitiativeGroupByOptions;
};

export const InitiativeGroup = observer(function InitiativeGroup(props: Props) {
  const { group, initiativesIds, groupBy } = props;

  const [isExpanded, setIsExpanded] = useState(true);

  const { t } = useTranslation();

  const toggleListGroup = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const shouldExpand = isExpanded || !groupBy;

  return (
    <div className={cn(`relative flex flex-shrink-0 flex-col border-transparent`)}>
      <Row className="sticky top-0 z-[2] w-full flex-shrink-0 border-b border-subtle bg-layer-1 py-1">
        <GroupHeader
          groupID={group.id}
          icon={group.icon}
          title={group.name === "All Initiatives" ? t("initiatives.all_initiatives") : group.name || ""}
          count={initiativesIds.length}
          toggleListGroup={toggleListGroup}
        />
      </Row>
      {shouldExpand && (
        <div className="relative">
          {initiativesIds &&
            initiativesIds.map((initiativeId) => <InitiativeBlock key={initiativeId} initiativeId={initiativeId} />)}
        </div>
      )}
    </div>
  );
});
