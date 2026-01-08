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
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
// components
import { IssuesLayoutsRoot } from "@/components/issues/issue-layouts";
// hooks
import { usePublish } from "@/hooks/store/publish";
import { useLabel } from "@/hooks/store/use-label";
import { useStates } from "@/hooks/store/use-state";
import { useMember } from "@/hooks/store/use-member";

const IssuesPage = observer(function IssuesPage() {
  // params
  const params = useParams<{ anchor: string }>();
  const { anchor } = params;
  const searchParams = useSearchParams();
  const peekId = searchParams.get("peekId") || undefined;
  // store
  const { fetchStates } = useStates();
  const { fetchLabels } = useLabel();
  const { fetchMembers } = useMember();

  useSWR(anchor ? `PUBLIC_STATES_${anchor}` : null, anchor ? () => fetchStates(anchor) : null);
  useSWR(anchor ? `PUBLIC_LABELS_${anchor}` : null, anchor ? () => fetchLabels(anchor) : null);
  useSWR(anchor ? `PUBLIC_MEMBERS_${anchor}` : null, anchor ? () => fetchMembers(anchor) : null);

  const publishSettings = usePublish(anchor);

  if (!publishSettings) return null;

  return <IssuesLayoutsRoot peekId={peekId} publishSettings={publishSettings} />;
});

export default IssuesPage;
