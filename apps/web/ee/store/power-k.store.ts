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

import { makeObservable } from "mobx";
// types
import { BasePowerKStore } from "@/store/base-power-k.store";
import type { IBasePowerKStore } from "@/store/base-power-k.store";

export type IPowerKStore = IBasePowerKStore;

export class PowerKStore extends BasePowerKStore implements IPowerKStore {
  constructor() {
    super();
    makeObservable(this, {});
  }
}
