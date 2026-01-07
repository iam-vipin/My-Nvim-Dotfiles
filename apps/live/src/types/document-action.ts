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

import type * as Y from "yjs";
import type { TPage } from "@plane/types";

export type TAdditionalDocumentTypes = "teamspace_page" | "workspace_page" | "server_agent" | "sync_agent";

export interface ActionCondition {
  name: string;
  check: (page: TPage, isInDocument: boolean, context?: any) => boolean;
}

export interface DocumentAction {
  name: string;
  execute: (
    xmlFragment: Y.XmlFragment,
    page: TPage,
    context: {
      childNodesMap?: Map<string, Y.XmlElement>;
      embeddedIDs?: Set<string>;
      [key: string]: any;
    }
  ) => void;
}

export interface ActionRule {
  condition: string;
  action: string;
  priority: number;
}
