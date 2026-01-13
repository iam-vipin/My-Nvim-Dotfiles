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

import type { Socket } from "socket.io-client";

// =============================================================================
// Connection
// =============================================================================

export type TConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

export type TSocketOptions = {
  withCredentials?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
  url: string;
  path?: string;
};

// =============================================================================
// Events - Define your event types here
// =============================================================================

/**
 * Events the client can send to the server
 */
export type TClientToServerEvents = Record<string, never>;

/**
 * Events the server sends to the client
 * Add your event types here as you build features
 */
export type TServerToClientEvents = Record<string, unknown>;

/**
 * Event payload types
 */
export type TBaseEvent = {
  workspace_id: string;
  actor_id?: string;
  timestamp?: string;
  eventId?: string;
};

export type TIssueEvent = TBaseEvent & {
  project_id: string;
  issue_id: string;
  data?: Record<string, unknown>;
};

export type TProjectEvent = TBaseEvent & {
  project_id: string;
  data?: Record<string, unknown>;
};

export type TMemberEvent = TBaseEvent & {
  member_id: string;
  member_email: string;
  member_display_name: string;
};

export type TUserPresenceEvent = {
  userId: string;
  displayName: string;
  email: string;
};

// =============================================================================
// Socket Instance
// =============================================================================

export type TSocketInstance = Socket<TServerToClientEvents, TClientToServerEvents>;

// =============================================================================
// Utility types for extracting event names and payloads
// =============================================================================

export type TServerEventName = keyof TServerToClientEvents;

export type TServerEventPayload<E extends TServerEventName> = TServerToClientEvents[E] extends (data: infer P) => void
  ? P
  : never;

export type TServerEventListener<E extends TServerEventName> = (data: TServerEventPayload<E>) => void;

// =============================================================================
// Context type
// =============================================================================

export type TSocketContext = {
  status: TConnectionStatus;
  subscribe: <E extends TServerEventName>(event: E, handler: TServerEventListener<E>) => () => void;
  subscribeAny: (pattern: RegExp | string, handler: (eventName: string, data: unknown) => void) => () => void;
};
