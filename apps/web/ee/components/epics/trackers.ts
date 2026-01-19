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

type ToggleType = "enable" | "disable";
type PropertyOperationAction = "create" | "update" | "delete";

type BaseTrackerProps = {
  workspaceSlug?: string;
  projectId?: string;
};

export const epicsTrackers = ({ workspaceSlug, projectId }: BaseTrackerProps) => {
  return {
    toggleEpicsClicked: () => {},

    toggleEpicsSuccess: (toggleType: ToggleType) => {},

    toggleEpicsError: (toggleType: ToggleType) => {},
  };
};

export const epicsPropertiesTrackers = ({ workspaceSlug, projectId }: BaseTrackerProps) => {
  return {
    epicPropertyOperation: (action: PropertyOperationAction, propertyId?: string, isActive?: boolean) => {},

    epicPropertyOperationSuccess: (action: PropertyOperationAction, propertyId?: string) => {},

    epicPropertyOperationError: (action: PropertyOperationAction, error?: Error, propertyId?: string) => {},
  };
};
