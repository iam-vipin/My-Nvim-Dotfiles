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
// types
import { Button } from "@plane/propel/button";
import type { IWorkspaceIntegration } from "@plane/types";
// ui
// hooks
import { useInstance } from "@/hooks/store/use-instance";
import useIntegrationPopup from "@/hooks/use-integration-popup";

type Props = {
  workspaceIntegration: false | IWorkspaceIntegration | undefined;
  provider: string | undefined;
};

export const GithubAuth = observer(function GithubAuth({ workspaceIntegration, provider }: Props) {
  // store hooks
  const { config } = useInstance();
  // hooks
  const { startAuth, isConnecting } = useIntegrationPopup({
    provider,
    github_app_name: config?.github_app_name || "",
    slack_client_id: config?.slack_client_id || "",
  });

  return (
    <div>
      {workspaceIntegration && workspaceIntegration?.id ? (
        <Button variant="primary" disabled>
          Successfully Connected
        </Button>
      ) : (
        <Button variant="primary" onClick={startAuth} loading={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect"}
        </Button>
      )}
    </div>
  );
});
