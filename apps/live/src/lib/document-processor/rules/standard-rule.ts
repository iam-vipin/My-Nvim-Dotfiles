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

import { RuleRegistry } from "../registries/rule-registry";

// Register standard rules
RuleRegistry.register({
  condition: "isDeletedAndInDocument",
  action: "removeNode",
  priority: 100, // Higher priority to handle deletions first
});

RuleRegistry.register({
  condition: "isNewPageAndNotInDocument",
  action: "addPageEmbed",
  priority: 10,
});

// Register rules for moved pages
RuleRegistry.register({
  condition: "isMovedPageButStillEmbed",
  action: "replacePageEmbedWithLink",
  priority: 90, // High priority but below deletions
});

// Register rule for nodes in document but not in backend
RuleRegistry.register({
  condition: "isInDocumentButNotInBackend",
  action: "removeNode",
  priority: 95, // High priority but below deletions
});
