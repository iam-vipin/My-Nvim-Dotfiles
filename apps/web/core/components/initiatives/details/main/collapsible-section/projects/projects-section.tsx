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
import { PlusIcon } from "@plane/propel/icons";
// plane imports
import { useTranslation } from "@plane/i18n";
// plane web
import { CollapsibleDetailSection } from "@/plane-web/components/common/layout/main/sections/collapsible-root";
// local components
import { InitiativeProjectsCollapsibleContent } from "./content";

type Props = {
  workspaceSlug: string;
  initiativeId: string;
  projectIds: string[] | null | undefined;
  disabled: boolean;
  toggleProjectModal: (value?: boolean) => void;
  isOpen: boolean;
  onToggle: () => void;
  count: number;
};

export const ProjectsSection = observer(function ProjectsSection(props: Props) {
  const { workspaceSlug, initiativeId, projectIds, disabled, toggleProjectModal, isOpen, onToggle, count } = props;
  const { t } = useTranslation();

  return (
    <CollapsibleDetailSection
      title={t("common.projects")}
      actionItemElement={
        !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleProjectModal(true);
            }}
            disabled={disabled}
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        )
      }
      count={count}
      collapsibleContent={
        <InitiativeProjectsCollapsibleContent
          workspaceSlug={workspaceSlug}
          projectIds={projectIds}
          initiativeId={initiativeId}
          disabled={disabled}
          toggleProjectModal={toggleProjectModal}
        />
      }
      isOpen={isOpen}
      onToggle={onToggle}
    />
  );
});
