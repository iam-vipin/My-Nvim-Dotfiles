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

import type {
  IBaseLayoutsBaseItem,
  IBaseLayoutsBaseProps,
  IBaseLayoutsBaseGroupProps,
  IBaseLayoutsBaseItemProps,
} from "./base";

export type IBaseLayoutsListItem = IBaseLayoutsBaseItem;

// Main List Layout Props

export type IBaseLayoutsListProps<T extends IBaseLayoutsListItem> = IBaseLayoutsBaseProps<T>;

// Group component props

export type IBaseLayoutsListGroupProps<T extends IBaseLayoutsListItem> = IBaseLayoutsBaseGroupProps<T>;

// Item component props

export type IBaseLayoutsListItemProps<T extends IBaseLayoutsListItem> = IBaseLayoutsBaseItemProps<T>;
