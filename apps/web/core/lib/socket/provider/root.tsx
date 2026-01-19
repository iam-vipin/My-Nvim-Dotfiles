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

import { createContext, useEffect, useState, useCallback, useMemo } from "react";
// local imports
import { SocketClient } from "../socket-client";
import type {
  TSocketContext,
  TSocketOptions,
  TConnectionStatus,
  TServerEventName,
  TServerEventListener,
} from "../types/root";

// =============================================================================
// Context
// =============================================================================

const SocketContext = createContext<TSocketContext | null>(null);

// Export context for use in hooks.ts
export { SocketContext };

// =============================================================================
// Provider Props
// =============================================================================

type TSocketProviderProps = {
  children: React.ReactNode;
  options: TSocketOptions;
  /**
   * When workspaceId changes, the socket will automatically
   * disconnect from the old workspace and connect to the new one.
   */
  workspaceId: string;
  /**
   * Whether the socket connection is enabled.
   * If false, no connection will be established.
   * @default true
   */
  enabled?: boolean;
};

// =============================================================================
// Provider Component
// =============================================================================

export function SocketProvider(props: TSocketProviderProps) {
  const { children, options, workspaceId, enabled = true } = props;
  // States
  const [status, setStatus] = useState<TConnectionStatus>("disconnected");

  // Initialize client once using lazy state initialization
  const [client] = useState(() => new SocketClient(options));

  // Subscribe to status changes
  useEffect(() => {
    return client.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });
  }, [client]);

  // Handle workspace changes and cleanup
  useEffect(() => {
    // Only connect if enabled
    if (enabled) {
      client.connect(workspaceId);
    }

    // Cleanup: disconnect when workspaceId changes or component unmounts
    return () => {
      client.disconnect();
    };
  }, [client, workspaceId, enabled]);

  const subscribe = useCallback(
    <E extends TServerEventName>(event: E, handler: TServerEventListener<E>) => {
      return client.subscribe(event, handler);
    },
    [client]
  );

  // Memoized context value
  const contextValue = useMemo<TSocketContext>(
    () => ({
      status,
      subscribe,
    }),
    [status, subscribe]
  );

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
}
