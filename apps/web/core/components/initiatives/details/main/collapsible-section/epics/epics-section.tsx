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

import React from "react";
import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
// plane web
import { CollapsibleDetailSection } from "@/components/common/layout/main/sections/collapsible-root";
// local components
import { InitiativeEpicsCollapsibleContent } from "./content";
import { EpicsTitleActions } from "./title-actions";

type Props = {
  workspaceSlug: string;
  initiativeId: string;
  disabled: boolean;
  toggleEpicModal: (value?: boolean) => void;
  isOpen: boolean;
  onToggle: () => void;
  count: number;
};

export const EpicsSection = observer(function EpicsSection(props: Props) {
  const { workspaceSlug, initiativeId, disabled, toggleEpicModal, isOpen, onToggle, count } = props;
  const { t } = useTranslation();

  return (
    <CollapsibleDetailSection
      title={t("common.epics")}
      actionItemElement={
        <EpicsTitleActions
          disabled={disabled}
          toggleEpicModal={toggleEpicModal}
          initiativeId={initiativeId}
          workspaceSlug={workspaceSlug}
        />
      }
      count={count}
      collapsibleContent={
        <InitiativeEpicsCollapsibleContent
          workspaceSlug={workspaceSlug}
          initiativeId={initiativeId}
          toggleEpicModal={toggleEpicModal}
          disabled={disabled}
        />
      }
      isOpen={isOpen}
      onToggle={onToggle}
    />
  );
});
