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

import { useCallback } from "react";
// plane imports
import type { TExtendedFileHandler } from "@plane/editor";

export type TExtendedEditorFileHandlersArgs = {
  projectId?: string;
  workspaceSlug: string;
};

export type TExtendedEditorConfig = {
  getExtendedEditorFileHandlers: (args: TExtendedEditorFileHandlersArgs) => TExtendedFileHandler;
};

export const useExtendedEditorConfig = (): TExtendedEditorConfig => {
  const getExtendedEditorFileHandlers: TExtendedEditorConfig["getExtendedEditorFileHandlers"] = useCallback(
    () => ({}),
    []
  );

  return {
    getExtendedEditorFileHandlers,
  };
};
