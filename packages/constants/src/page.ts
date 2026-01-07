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

export enum EPageAccess {
  PUBLIC = 0,
  PRIVATE = 1,
}

export type TCreatePageModal = {
  isOpen: boolean;
  pageAccess?: EPageAccess;
};

export const DEFAULT_CREATE_PAGE_MODAL_DATA: TCreatePageModal = {
  isOpen: false,
  pageAccess: EPageAccess.PUBLIC,
};

export const DEFAULT_PAGE_SORT_ORDER = 65535;
export const PAGE_SORT_ORDER_INCREMENT = 1000;
