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

import { useCallback, useMemo } from "react";
// plane editor
import type { TMentionSection } from "@plane/editor";
// plane types
import type { TSearchEntities, TSearchResponse } from "@plane/types";

export type TUseAdditionalEditorMentionArgs = {
  enableAdvancedMentions: boolean;
};

export type TAdditionalEditorMentionHandlerArgs = {
  response: TSearchResponse;
};

export type TAdditionalEditorMentionHandlerReturnType = {
  sections: TMentionSection[];
};

export type TAdditionalParseEditorContentArgs = {
  id: string;
  entityType: TSearchEntities;
};

export type TAdditionalParseEditorContentReturnType =
  | {
      redirectionPath: string;
      textContent: string;
    }
  | undefined;

export const useAdditionalEditorMention = (_args: TUseAdditionalEditorMentionArgs) => {
  const updateAdditionalSections = useCallback(
    (_args: TAdditionalEditorMentionHandlerArgs): TAdditionalEditorMentionHandlerReturnType => ({
      sections: [],
    }),
    []
  );

  const parseAdditionalEditorContent = useCallback(
    (_args: TAdditionalParseEditorContentArgs): TAdditionalParseEditorContentReturnType => undefined,
    []
  );

  const editorMentionTypes: TSearchEntities[] = useMemo(() => ["user_mention"], []);

  return {
    updateAdditionalSections,
    parseAdditionalEditorContent,
    editorMentionTypes,
  };
};
