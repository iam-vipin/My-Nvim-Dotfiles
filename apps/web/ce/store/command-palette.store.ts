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

import { computed, makeObservable } from "mobx";
// types / constants
import type { IBaseCommandPaletteStore } from "@/store/base-command-palette.store";
import { BaseCommandPaletteStore } from "@/store/base-command-palette.store";

export interface ICommandPaletteStore extends IBaseCommandPaletteStore {
  // computed
  isAnyModalOpen: boolean;
}

export class CommandPaletteStore extends BaseCommandPaletteStore implements ICommandPaletteStore {
  constructor() {
    super();
    makeObservable(this, {
      // computed
      isAnyModalOpen: computed,
    });
  }

  /**
   * Checks whether any modal is open or not in the base command palette.
   * @returns boolean
   */
  get isAnyModalOpen(): boolean {
    return Boolean(super.getCoreModalsState());
  }
}
