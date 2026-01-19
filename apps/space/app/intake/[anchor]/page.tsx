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
// hooks
import { usePublish } from "@/hooks/store/publish";
import CreateIssueModal from "@/plane-web/components/intake/create/create-issue-modal";
import type { Route } from "./+types/page";

const IssuesPage = observer(function IssuesPage(props: Route.ComponentProps) {
  const { params } = props;
  const { anchor } = params;
  // params

  const publishSettings = usePublish(anchor);

  if (!publishSettings?.project_details) return null;

  return <CreateIssueModal project={publishSettings.project_details} anchor={anchor} />;
});

export default IssuesPage;
