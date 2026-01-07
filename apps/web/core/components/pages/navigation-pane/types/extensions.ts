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

import type { ReactNode } from "react";
import type { EPageStoreType } from "@/plane-web/hooks/store";
import type { TPageInstance } from "@/store/pages/base-page";

export interface INavigationPaneExtensionProps<T = Record<string, unknown>> {
  page: TPageInstance;
  extensionData?: T;
  storeType: EPageStoreType;
}

export interface INavigationPaneExtensionComponent<T = Record<string, unknown>> {
  (props: INavigationPaneExtensionProps<T>): ReactNode;
}

export interface INavigationPaneExtension<T = Record<string, unknown>> {
  id: string;
  triggerParam: string;
  component: INavigationPaneExtensionComponent<T>;
  data?: T;
  width?: number;
}
