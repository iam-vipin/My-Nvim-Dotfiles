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

import type { ReactNode, MouseEvent as ReactMouseEvent } from "react";
import type { EPortalWidth, EPortalPosition } from "./constants";

export interface BasePortalProps {
  children: ReactNode;
  className?: string;
}

export interface PortalWrapperProps extends BasePortalProps {
  portalId?: string;
  fallbackToDocument?: boolean;
  onMount?: () => void;
  onUnmount?: () => void;
}

export interface ModalPortalProps extends BasePortalProps {
  isOpen: boolean;
  onClose?: () => void;
  portalId?: string;
  overlayClassName?: string;
  contentClassName?: string;
  width?: EPortalWidth;
  position?: EPortalPosition;
  fullScreen?: boolean;
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export type PortalEventHandler = () => void;
export type PortalKeyboardHandler = (event: KeyboardEvent) => void;
export type PortalMouseHandler = (event: ReactMouseEvent) => void;
