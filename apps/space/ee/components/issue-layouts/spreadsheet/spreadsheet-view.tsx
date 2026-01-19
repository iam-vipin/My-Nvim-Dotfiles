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

import React, { useRef } from "react";
import { observer } from "mobx-react";
// types
import type { IIssueDisplayProperties } from "@plane/types";
// components
import { LogoSpinner } from "@/components/common/logo-spinner";
// constants
import { SPREADSHEET_PROPERTY_LIST } from "@/plane-web/constants/issue";
// local components
import { SpreadsheetTable } from "./spreadsheet-table";

type Props = {
  displayProperties: IIssueDisplayProperties;
  issueIds: string[] | undefined;
  canLoadMoreIssues: boolean;
  loadMoreIssues: () => void;
};

export const SpreadsheetView = observer(function SpreadsheetView(props: Props) {
  const { displayProperties, issueIds, canLoadMoreIssues, loadMoreIssues } = props;
  // refs
  const containerRef = useRef<HTMLTableElement | null>(null);

  const spreadsheetColumnsList = SPREADSHEET_PROPERTY_LIST;

  if (!issueIds || issueIds.length === 0)
    return (
      <div className="grid h-full w-full place-items-center">
        <LogoSpinner />
      </div>
    );

  return (
    <div className="relative flex h-full w-full flex-col overflow-x-hidden whitespace-nowrap rounded-lg text-secondary">
      <div ref={containerRef} className="vertical-scrollbar horizontal-scrollbar scrollbar-lg h-full w-full">
        <SpreadsheetTable
          displayProperties={displayProperties}
          issueIds={issueIds}
          containerRef={containerRef}
          canLoadMoreIssues={canLoadMoreIssues}
          loadMoreIssues={loadMoreIssues}
          spreadsheetColumnsList={spreadsheetColumnsList}
        />
      </div>
    </div>
  );
});
