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

// types
import type { IIssueDisplayProperties } from "@plane/types";
// lib
import { store } from "@/lib/store-context";

export type TShouldRenderDisplayProperty = {
  workspaceSlug: string;
  projectId: string | undefined;
  key: keyof IIssueDisplayProperties;
};

export const shouldRenderDisplayProperty = (props: TShouldRenderDisplayProperty) => {
  const { key } = props;
  switch (key) {
    case "issue_type":
      return false;
    default:
      return true;
  }
};

export const shouldRenderColumn = (key: keyof IIssueDisplayProperties): boolean => {
  const isEstimateEnabled: boolean = store.projectRoot.project.currentProjectDetails?.estimate !== null;
  switch (key) {
    case "estimate":
      return isEstimateEnabled;
    default:
      return true;
  }
};
