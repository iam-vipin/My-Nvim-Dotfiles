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

import type { Editor } from "@tiptap/core";
import type { Plugin } from "@tiptap/pm/state";
// types
import type { TFileHandler } from "@/types";
// local imports
import { TrackFileDeletionPlugin } from "./delete";
import { TrackFileRestorationPlugin } from "./restore";

type TArgs = {
  editor: Editor;
  fileHandler: TFileHandler;
  isEditable: boolean;
};

export const FilePlugins = (args: TArgs): Plugin[] => {
  const { editor, fileHandler, isEditable } = args;

  return [
    ...(isEditable && "delete" in fileHandler ? [TrackFileDeletionPlugin(editor, fileHandler.delete)] : []),
    TrackFileRestorationPlugin(editor, fileHandler.restore),
  ];
};
