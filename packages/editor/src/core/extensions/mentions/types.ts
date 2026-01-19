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

// plane types
import type { TSearchEntities } from "@plane/types";

export enum EMentionComponentAttributeNames {
  ID = "id",
  ENTITY_IDENTIFIER = "entity_identifier",
  ENTITY_NAME = "entity_name",
}

export type TMentionComponentAttributes = {
  [EMentionComponentAttributeNames.ID]: string | null;
  [EMentionComponentAttributeNames.ENTITY_IDENTIFIER]: string | null;
  [EMentionComponentAttributeNames.ENTITY_NAME]: TSearchEntities | null;
};
