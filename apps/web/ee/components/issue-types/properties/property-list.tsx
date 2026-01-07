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

import type { FC } from "react";
import { observer } from "mobx-react";
// plane imports
import type { EIssuePropertyType, IIssueProperty } from "@plane/types";
// plane web imports
import { IssuePropertyOptionsProvider } from "@/plane-web/lib";
// local imports
import { IssuePropertyCreateListItem } from "./property-create-list-item";
import { IssuePropertyListItem } from "./property-list-item";
import type { TCustomPropertyOperations } from "./property-list-item";
import type { TIssuePropertyCreateList } from "./root";

type TIssuePropertyList = {
  properties: IIssueProperty<EIssuePropertyType>[] | undefined;
  issuePropertyCreateList: TIssuePropertyCreateList[];
  customPropertyOperations: TCustomPropertyOperations;
  containerRef: React.RefObject<HTMLDivElement>;
  lastElementRef: React.RefObject<HTMLDivElement>;
  isUpdateAllowed: boolean;
  trackers?: {
    [key in "create" | "update" | "delete" | "quickActions"]?: {
      button?: string;
      eventName?: string;
    };
  };
};

export const IssuePropertyList = observer(function IssuePropertyList(props: TIssuePropertyList) {
  const {
    properties,
    issuePropertyCreateList,
    customPropertyOperations,
    containerRef,
    lastElementRef,
    isUpdateAllowed,
    trackers,
  } = props;

  return (
    <div className="w-full mt-1">
      <div ref={containerRef} className="w-full overflow-y-auto px-6 transition-all">
        {properties &&
          properties.map((property) => (
            <IssuePropertyOptionsProvider
              key={property.id}
              customPropertyId={property.id}
              customPropertyOperations={customPropertyOperations}
            >
              <IssuePropertyListItem
                customPropertyId={property.id}
                customPropertyOperations={customPropertyOperations}
                isUpdateAllowed={isUpdateAllowed}
                trackers={trackers}
              />
            </IssuePropertyOptionsProvider>
          ))}
        {/* Issue properties create list */}
        {issuePropertyCreateList.map((issueProperty, index) => (
          <IssuePropertyOptionsProvider
            key={issueProperty.key}
            customPropertyId={issueProperty.id}
            customPropertyOperations={customPropertyOperations}
          >
            <IssuePropertyCreateListItem
              ref={index === issuePropertyCreateList.length - 1 ? lastElementRef : undefined}
              issuePropertyCreateListData={issueProperty}
              customPropertyOperations={customPropertyOperations}
              isUpdateAllowed
              trackers={trackers}
            />
          </IssuePropertyOptionsProvider>
        ))}
      </div>
    </div>
  );
});
