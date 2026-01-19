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

import { useCallback, useEffect } from "react";
// plane editor
import type { TMentionSection, TMentionSuggestion } from "@plane/editor";
// plane ui
import { Avatar } from "@plane/ui";
// constants
import { CallbackHandlerStrings } from "@/constants/callback-handler-strings";
// helpers
import { callNative, transformMentionSuggestions } from "@/helpers";
// store
import { useMembers } from "@/hooks/store";
// types
import type { TMentionSuggestionResponse } from "@/types/mention";

export const useEditorMention = () => {
  const { setMembers: setMembersList, filterMembersByQuery } = useMembers();

  // Retrieves members from the native side
  const getMembers = useCallback(async (): Promise<TMentionSuggestionResponse[]> => {
    await callNative(CallbackHandlerStrings.getMembers).then((members) => {
      const mentionSuggestions = transformMentionSuggestions(members);
      if (mentionSuggestions?.length > 0) {
        setMembersList(mentionSuggestions);
      }
      return mentionSuggestions;
    });
    return [];
  }, [setMembersList]);

  // Sets the members list
  const setMembers = useCallback(
    (members?: TMentionSuggestionResponse[]) => {
      if (!members) return;
      const mentionSuggestions = transformMentionSuggestions(members);
      setMembersList(mentionSuggestions);
    },
    [setMembersList]
  );

  // Fetch members on component mount
  useEffect(() => {
    getMembers();
    // This is a one-time fetch to get the members list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  window.getMembers = getMembers;
  window.setMembers = setMembers;

  // Fetch mentions based on the query
  // This function is called when the user types in the mention input
  // It filters the members list based on the query and returns the matching members
  const fetchMentions = useCallback(
    async (query: string): Promise<TMentionSection[]> => {
      try {
        const response = filterMembersByQuery(query);
        const suggestionSections: TMentionSection[] = [];
        if (!response) {
          throw new Error("No response found");
        }
        if (response && response.length > 0) {
          const items: TMentionSuggestion[] = response.map((user) => ({
            icon: (
              <Avatar
                className="flex-shrink-0"
                src={user.avatarUrl}
                name={user.displayName}
                fallbackText={user.displayName}
              />
            ),
            id: user.id ?? "",
            entity_identifier: user.id ?? "",
            entity_name: "user_mention",
            title: user.displayName ?? "",
          }));
          suggestionSections.push({
            key: "users",
            title: "Users",
            items,
          });
        }
        return suggestionSections;
      } catch (error) {
        console.error("Error in fetching mentions for project pages:", error);
        throw error;
      }
    },

    [filterMembersByQuery]
  );

  return {
    fetchMentions,
  };
};
