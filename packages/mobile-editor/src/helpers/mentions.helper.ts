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

import { TMentionSuggestionResponse } from "@/types/mention";

// It transforms the members list into a format suitable for the mention suggestions
export const transformMentionSuggestions = (members: TMentionSuggestionResponse[]): TMentionSuggestionResponse[] =>
  members.map((member: TMentionSuggestionResponse) => ({
    id: member.id ?? "",
    displayName: member?.displayName ?? "",
    firstName: member?.firstName ?? "",
    lastName: member?.lastName ?? "",
    avatarUrl: member?.avatarUrl,
  }));

export const transformMentionHighlights = (userId: string) => [userId];
