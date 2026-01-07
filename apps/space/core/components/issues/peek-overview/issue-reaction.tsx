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

import { observer } from "mobx-react";
// components
import { IssueEmojiReactions } from "@/components/issues/reactions/issue-emoji-reactions";
import { IssueVotes } from "@/components/issues/reactions/issue-vote-reactions";
// hooks
import { usePublish } from "@/hooks/store/publish";
import useIsInIframe from "@/hooks/use-is-in-iframe";

type Props = {
  anchor: string;
};

export const IssueReactions = observer(function IssueReactions(props: Props) {
  const { anchor } = props;
  // store hooks
  const { canVote, canReact } = usePublish(anchor);
  const isInIframe = useIsInIframe();

  return (
    <div className="mt-4 flex items-center gap-3">
      {canVote && (
        <div className="flex items-center gap-2">
          <IssueVotes anchor={anchor} />
        </div>
      )}
      {!isInIframe && canReact && (
        <div className="flex items-center gap-2">
          <IssueEmojiReactions anchor={anchor} />
        </div>
      )}
    </div>
  );
});
