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

import { useContext } from "react";
// context
import { StoreContext } from "@/lib/store-context";
// mobx store
import type { IProjectPageStore } from "@/store/pages/project-page.store";

export enum EPageStoreType {
  PROJECT = "PROJECT_PAGE",
}

export type TReturnType = {
  [EPageStoreType.PROJECT]: IProjectPageStore;
};

export const usePageStore = <T extends EPageStoreType>(storeType: T): TReturnType[T] => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error("usePageStore must be used within StoreProvider");

  if (storeType === EPageStoreType.PROJECT) {
    return context.projectPages;
  }

  throw new Error(`Invalid store type: ${storeType}`);
};
