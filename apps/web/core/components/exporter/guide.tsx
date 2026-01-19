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

import { useState } from "react";
import { observer } from "mobx-react";
import { useParams, useSearchParams } from "next/navigation";
import { mutate } from "swr";
import { EXPORT_SERVICES_LIST } from "@/constants/fetch-keys";
import { ExportForm } from "./export-form";
import { PrevExports } from "./prev-exports";

const IntegrationGuide = observer(function IntegrationGuide() {
  // router
  const { workspaceSlug } = useParams();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider");
  // state
  const per_page = 10;
  const [cursor, setCursor] = useState<string | undefined>(`10:0:0`);

  return (
    <>
      <div className="h-full w-full">
        <>
          <ExportForm
            workspaceSlug={workspaceSlug}
            provider={provider}
            mutateServices={() => mutate(EXPORT_SERVICES_LIST(workspaceSlug, `${cursor}`, `${per_page}`))}
          />
          <PrevExports workspaceSlug={workspaceSlug} cursor={cursor} per_page={per_page} setCursor={setCursor} />
        </>
      </div>
    </>
  );
});

export default IntegrationGuide;
