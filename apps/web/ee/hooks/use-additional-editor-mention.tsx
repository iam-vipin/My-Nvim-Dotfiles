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
import { useParams } from "react-router";
// plane imports
import type { TMentionSection, TMentionSuggestion } from "@plane/editor";
import type { TIssueSearchResponse, TSearchEntities } from "@plane/types";
// ce imports
import type {
  TAdditionalEditorMentionHandlerArgs,
  TAdditionalEditorMentionHandlerReturnType,
  TAdditionalParseEditorContentArgs,
  TAdditionalParseEditorContentReturnType,
  TUseAdditionalEditorMentionArgs,
} from "@/ce/hooks/use-additional-editor-mention";
import { useAdditionalEditorMention as useCoreAdditionalEditorMention } from "@/ce/hooks/use-additional-editor-mention";
// local imports
import { EditorWorkItemMentionLogo } from "../components/editor/embeds/mentions/work-item/logo";
import { useFlag } from "./store";

export const useAdditionalEditorMention = (args: TUseAdditionalEditorMentionArgs) => {
  const { enableAdvancedMentions } = args;
  // params
  const { workspaceSlug } = useParams();
  // feature flag
  const isAdvancedMentionsEnabled = useFlag(workspaceSlug, "EDITOR_ADVANCED_MENTIONS");
  // ce editor mention
  const { editorMentionTypes: coreEditorMentionTypes } = useCoreAdditionalEditorMention({
    enableAdvancedMentions,
  });

  const updateAdditionalSections = useCallback(
    (args: TAdditionalEditorMentionHandlerArgs): TAdditionalEditorMentionHandlerReturnType => {
      const { response } = args;
      if (!isAdvancedMentionsEnabled) {
        return {
          sections: [],
        };
      }

      const suggestionSections: TMentionSection[] = [];
      Object.keys(response).map((key) => {
        const responseKey = key as TSearchEntities;
        const responseData = response[responseKey];
        if (responseKey === "issue_mention" && responseData && responseData.length > 0) {
          const items: TMentionSuggestion[] = (responseData as TIssueSearchResponse[]).map((issue) => ({
            icon: (
              <EditorWorkItemMentionLogo
                className="shrink-0 size-4"
                projectId={issue.project_id}
                stateColor={issue.state__color}
                stateGroup={issue.state__group ?? undefined}
                workItemTypeId={issue.type_id}
              />
            ),
            id: issue.id,
            entity_identifier: issue.id,
            entity_name: "issue_mention",
            title: issue.name,
          }));
          suggestionSections.push({
            key: "issues",
            title: "Work items",
            items,
          });
        }
      });

      return {
        sections: suggestionSections,
      };
    },
    [isAdvancedMentionsEnabled]
  );

  const parseAdditionalEditorContent = useCallback(
    (args: TAdditionalParseEditorContentArgs): TAdditionalParseEditorContentReturnType => {
      const {} = args;
      return undefined;
    },
    []
  );

  const editorMentionTypes: TSearchEntities[] = useMemo(() => {
    const types = [...coreEditorMentionTypes];
    if (!enableAdvancedMentions) return types;
    if (isAdvancedMentionsEnabled) {
      types.push("issue_mention");
    }
    return types;
  }, [coreEditorMentionTypes, enableAdvancedMentions, isAdvancedMentionsEnabled]);

  return {
    editorMentionTypes,
    updateAdditionalSections,
    parseAdditionalEditorContent,
  };
};
