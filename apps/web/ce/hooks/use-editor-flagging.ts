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

// editor
import type { TExtensions } from "@plane/editor";
import type { EPageStoreType } from "@/plane-web/hooks/store";

export type TEditorFlaggingHookReturnType = {
  document: {
    disabled: TExtensions[];
    flagged: TExtensions[];
  };
  liteText: {
    disabled: TExtensions[];
    flagged: TExtensions[];
  };
  richText: {
    disabled: TExtensions[];
    flagged: TExtensions[];
  };
};

export type TEditorFlaggingHookProps = {
  workspaceSlug: string;
  projectId?: string;
  storeType?: EPageStoreType;
};

/**
 * @description extensions disabled in various editors
 */
export const useEditorFlagging = (_props: TEditorFlaggingHookProps): TEditorFlaggingHookReturnType => ({
  document: {
    disabled: ["ai", "collaboration-caret"],
    flagged: [],
  },
  liteText: {
    disabled: ["ai", "collaboration-caret"],
    flagged: [],
  },
  richText: {
    disabled: ["ai", "collaboration-caret"],
    flagged: [],
  },
});
