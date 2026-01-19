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

import type { TPowerKCommandConfig, TPowerKContext, TPowerKPageType } from "../../core/types";
import { PowerKModalPagesList } from "../pages";
import { PowerKContextBasedPagesList } from "../pages/context-based";
import { PowerKModalSearchMenu } from "./search-menu";

export type TPowerKCommandsListProps = {
  activePage: TPowerKPageType | null;
  context: TPowerKContext;
  handleCommandSelect: (command: TPowerKCommandConfig) => void;
  handlePageDataSelection: (data: unknown) => void;
  isWorkspaceLevel: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleSearchMenuClose?: () => void;
};

export function ProjectsAppPowerKCommandsList(props: TPowerKCommandsListProps) {
  const {
    activePage,
    context,
    handleCommandSelect,
    handlePageDataSelection,
    isWorkspaceLevel,
    searchTerm,
    setSearchTerm,
    handleSearchMenuClose,
  } = props;

  return (
    <>
      <PowerKModalSearchMenu
        activePage={activePage}
        context={context}
        isWorkspaceLevel={!context.params.projectId || isWorkspaceLevel}
        searchTerm={searchTerm}
        updateSearchTerm={setSearchTerm}
        handleSearchMenuClose={handleSearchMenuClose}
      />
      <PowerKContextBasedPagesList
        activeContext={context.activeContext}
        activePage={activePage}
        handleSelection={handlePageDataSelection}
      />
      <PowerKModalPagesList
        activePage={activePage}
        context={context}
        onPageDataSelect={handlePageDataSelection}
        onCommandSelect={handleCommandSelect}
      />
    </>
  );
}
