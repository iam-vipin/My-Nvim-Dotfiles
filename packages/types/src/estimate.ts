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

import type { EEstimateSystem, EEstimateUpdateStages } from "./enums";

export interface IEstimatePoint {
  id: string | undefined;
  key: number | undefined;
  value: string | undefined;
  description: string | undefined;
  workspace: string | undefined;
  project: string | undefined;
  estimate: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  created_by: string | undefined;
  updated_by: string | undefined;
}

export type TEstimateSystemKeys = EEstimateSystem.POINTS | EEstimateSystem.CATEGORIES | EEstimateSystem.TIME;

export interface IEstimate {
  id: string | undefined;
  name: string | undefined;
  description: string | undefined;
  type: TEstimateSystemKeys | undefined; // categories, points, time
  points: IEstimatePoint[] | undefined;
  workspace: string | undefined;
  project: string | undefined;
  last_used: boolean | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  created_by: string | undefined;
  updated_by: string | undefined;
}

export interface IEstimateFormData {
  estimate?: {
    name?: string;
    type?: string;
    last_used?: boolean;
  };
  estimate_points: {
    id?: string | undefined;
    key: number;
    value: string;
  }[];
}

export type TEstimatePointsObject = {
  id?: string | undefined;
  key: number;
  value: string;
};

export type TTemplateValues = {
  title: string;
  i18n_title: string;
  values: TEstimatePointsObject[];
  hide?: boolean;
};

export type TEstimateSystem = {
  name: string;
  i18n_name: string;
  templates: Record<string, TTemplateValues>;
  is_available: boolean;
  is_ee: boolean;
};

export type TEstimateSystems = {
  [K in TEstimateSystemKeys]: TEstimateSystem;
};

// update estimates
export type TEstimateUpdateStageKeys =
  | EEstimateUpdateStages.CREATE
  | EEstimateUpdateStages.EDIT
  | EEstimateUpdateStages.SWITCH;

export type TEstimateTypeErrorObject = {
  oldValue: string;
  newValue: string;
  message: string | undefined;
};

export type TEstimateTypeError = Record<number, TEstimateTypeErrorObject> | undefined;
