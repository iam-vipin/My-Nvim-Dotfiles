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

import type { E_INTEGRATION_KEYS, TWorkspaceConnection } from "@plane/types";
import { getAPIClient } from "@/services/client";

const apiClient = getAPIClient();

export const createOrUpdateConnection = async (
  workspaceId: string,
  connection_type: E_INTEGRATION_KEYS,
  connection: Partial<TWorkspaceConnection<any>>,
  connectionId?: string
) => {
  const connections = await apiClient.workspaceConnection.listWorkspaceConnections({
    workspace_id: workspaceId,
    connection_type: connection_type,
    connection_id: connectionId,
  });

  if (connections.length > 1) {
    throw new Error("More than one connections exist.");
  }

  if (connections.length === 0) {
    // Create a new connection
    await apiClient.workspaceConnection.createWorkspaceConnection(connection);
  } else {
    const targetConnection = connections[0];
    if (targetConnection.id) {
      await apiClient.workspaceConnection.updateWorkspaceConnection(targetConnection.id, connection);
    }
  }
};
