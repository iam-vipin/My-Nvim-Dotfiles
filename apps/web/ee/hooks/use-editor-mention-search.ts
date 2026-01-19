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

import { useCallback } from "react";
// plane types
import type { TSearchEntityRequestPayload, TUserSearchResponse } from "@plane/types";
// hooks
import { useMember } from "@/hooks/store/use-member";

type TArgs = {
  memberIds: string[];
};

export const useEditorMentionSearch = (args: TArgs) => {
  const { memberIds } = args;
  // store hooks
  const { getUserDetails } = useMember();

  const searchEntity = useCallback(
    async (payload: TSearchEntityRequestPayload) => {
      let items: TUserSearchResponse[] = memberIds.map((userId) => {
        const userDetails = getUserDetails(userId);
        return {
          member__avatar_url: userDetails?.avatar_url ?? "",
          member__display_name: userDetails?.display_name ?? "",
          member__id: userDetails?.id ?? "",
        };
      });
      items = items.filter((u) => u.member__display_name.toLowerCase().includes(payload.query.toLowerCase()));
      return {
        user_mention: items,
      };
    },
    [getUserDetails, memberIds]
  );

  return {
    searchEntity,
  };
};
