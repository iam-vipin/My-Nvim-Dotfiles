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
import { SocketContext } from "./provider/root";
import type { TServerEventName, TServerEventPayload, TConnectionStatus, TSocketContext } from "./types";

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
 * Subscribe to multiple socket events with a single handler
 * Useful for handling related events (e.g., all issue events) in one place
 *
 * @example
 * // Subscribe to all issue events
 * useSocketEvents(
 *   ['issue.created', 'issue.updated', 'issue.deleted'],
 *   (eventName, data) => {
 *     console.log(`Received ${eventName}:`, data);
 *     mutate('/api/issues'); // Revalidate issues list
 *   }
 * );
 */
export function useSocketEvents(
  events: TServerEventName[],
  handler: (eventName: TServerEventName, data: unknown) => void,
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
    if (!enabled || status !== "connected" || events.length === 0) {
      return;
    }

    // Subscribe to all events
    const unsubscribeFunctions = events.map((event) =>
      subscribe(event, (data) => {
        handlerRef.current(event, data);
      })
    );

    // Cleanup: unsubscribe from all events
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    };
  }, [enabled, events, status, subscribe]);
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
 * Subscribe to socket events matching a pattern (prefix or regex)
 * Uses Socket.IO's onAny() internally, which has performance implications.
 *
 * WARNING: This processes EVERY event to check if it matches the pattern.
 * Prefer using `useSocketEvents` with specific event names when possible.
 *
 * @example
 * // Subscribe to all issue events using prefix
 * useSocketEventPattern('issue.', (eventName, data) => {
 *   console.log(`Matched ${eventName}:`, data);
 *   mutate('/api/issues');
 * });
 *
 * @example
 * // Subscribe using regex
 * useSocketEventPattern(/^(issue|project)\./, (eventName, data) => {
 *   console.log(`Matched ${eventName}:`, data);
 * });
 */
export function useSocketEventPattern(
  pattern: RegExp | string,
  handler: (eventName: string, data: unknown) => void,
  options: { enabled?: boolean } = {}
): void {
  const { enabled = true } = options;
  const { subscribeAny, status } = useSocketInternal();

  // Use ref to avoid re-subscribing when handler changes
  const handlerRef = useRef(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled || status !== "connected") {
      return;
    }

    const unsubscribe = subscribeAny(pattern, (eventName, data) => {
      handlerRef.current(eventName, data);
    });

    return unsubscribe;
  }, [enabled, pattern, status, subscribeAny]);
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
