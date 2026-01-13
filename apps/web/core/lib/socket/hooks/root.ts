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

import { useEffect, useLayoutEffect, useRef, useCallback, useContext } from "react";
// local imports
import { SocketContext } from "@/lib/socket/provider/root";
import type { TServerEventName, TServerEventPayload, TConnectionStatus, TSocketContext } from "@/lib/socket/types";

// Internal hook to access socket context
function useSocketInternal(): TSocketContext {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
}

/**
 * Get the current connection status
 *
 * @example
 * const { isConnected, isReconnecting } = useSocketStatus();
 */
export function useSocketStatus(): {
  status: TConnectionStatus;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  isDisconnected: boolean;
} {
  const { status } = useSocketInternal();

  return {
    status,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
    isReconnecting: status === "reconnecting",
    isDisconnected: status === "disconnected",
  };
}

/**
 * Subscribe to a socket event with automatic cleanup
 *
 * @example
 * useSocketEvent("issue:updated", (data) => {
 *   console.log("Issue updated:", data.issue_id);
 *   // Trigger your SWR revalidation here
 *   mutate(`/api/issues/${data.issue_id}`);
 * });
 */
export function useSocketEvent<E extends TServerEventName>(
  event: E,
  handler: (data: TServerEventPayload<E>) => void,
  options: { enabled?: boolean } = {}
): void {
  const { enabled = true } = options;
  const { subscribe, status } = useSocketInternal();

  // Use ref to avoid re-subscribing when handler changes
  const handlerRef = useRef(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled || status !== "connected") {
      return;
    }

    const unsubscribe = subscribe(event, (data) => {
      handlerRef.current(data);
    });

    return unsubscribe;
  }, [event, enabled, status, subscribe]);
}

/**
 * Filter socket events by a condition
 *
 * @example
 * // Only handle events for a specific project
 * useFilteredSocketEvent(
 *   "issue:updated",
 *   (data) => data.project_id === currentProjectId,
 *   (data) => {
 *     mutate(`/api/projects/${data.project_id}/issues`);
 *   }
 * );
 */
export function useFilteredSocketEvent<E extends TServerEventName>(
  event: E,
  filter: (data: TServerEventPayload<E>) => boolean,
  handler: (data: TServerEventPayload<E>) => void,
  options: { enabled?: boolean } = {}
): void {
  const filterRef = useRef(filter);
  const handlerRef = useRef(handler);

  useLayoutEffect(() => {
    filterRef.current = filter;
    handlerRef.current = handler;
  });

  const wrappedHandler = useCallback((data: TServerEventPayload<E>) => {
    if (filterRef.current(data)) {
      handlerRef.current(data);
    }
  }, []);

  useSocketEvent(event, wrappedHandler, options);
}

/**
 * Access the socket context
 *
 * @example
 * const { status, subscribe } = useSocket();
 */
export function useSocket(): TSocketContext {
  return useSocketInternal();
}
