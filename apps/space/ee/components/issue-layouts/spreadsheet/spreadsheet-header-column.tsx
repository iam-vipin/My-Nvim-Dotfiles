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
//types
import type { IIssueDisplayProperties } from "@plane/types";
//components
import { WithDisplayPropertiesHOC } from "@/components/issues/issue-layouts/with-display-properties-HOC";
import { HeaderColumn } from "./columns/header-column";

interface Props {
  displayProperties: IIssueDisplayProperties;
  property: keyof IIssueDisplayProperties;
}
export const SpreadsheetHeaderColumn = observer(function SpreadsheetHeaderColumn(props: Props) {
  const { displayProperties, property } = props;

  return (
    <WithDisplayPropertiesHOC displayProperties={displayProperties} displayPropertyKey={property}>
      <th
        className="h-11 w-full min-w-36 max-w-48 items-center bg-layer-2 text-13 font-medium px-4 py-1 border border-b-0 border-t-0 border-subtle"
        tabIndex={0}
      >
        <HeaderColumn property={property} />
      </th>
    </WithDisplayPropertiesHOC>
  );
});
