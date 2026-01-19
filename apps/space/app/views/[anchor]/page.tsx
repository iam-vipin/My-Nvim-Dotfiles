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
// components
import { PoweredBy } from "@/components/common/powered-by";
// hooks
import { usePublish } from "@/hooks/store/publish";
// plane-web
import { ViewLayoutsRoot } from "@/plane-web/components/issue-layouts/root";

const ViewsPage = observer(function ViewsPage() {
  // params
  const params = useParams<{ anchor: string }>();
  const { anchor } = params;
  const searchParams = useSearchParams();
  const peekId = searchParams.get("peekId") || undefined;

  const publishSettings = usePublish(anchor);

  if (!publishSettings) return null;

  return (
    <>
      <ViewLayoutsRoot peekId={peekId} publishSettings={publishSettings} />
      <PoweredBy />
    </>
  );
});

export default ViewsPage;
