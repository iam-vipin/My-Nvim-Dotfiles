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

import type { TButtonVariant } from "../button/helper";
import type { TAlign } from "../utils/placement";
import type { CompactAssetType, DetailedAssetType } from "./assets/asset-types";

export interface ActionButton extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: string;
  variant?: TButtonVariant;
  [key: `data-${string}`]: string | undefined;
}

export interface BaseEmptyStateCommonProps {
  title?: string;
  actions?: ActionButton[];
  /** CSS classes for the content wrapper */
  className?: string;
  /** CSS classes for the root container */
  rootClassName?: string;
  /** CSS classes for the asset wrapper */
  assetClassName?: string;
  description?: string;
  assetKey?: CompactAssetType | DetailedAssetType;
  asset?: React.ReactNode;
  align?: TAlign;
  customButton?: React.ReactNode;
}
