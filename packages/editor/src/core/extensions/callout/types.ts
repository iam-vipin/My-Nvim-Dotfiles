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

import type { Node as ProseMirrorNode } from "@tiptap/core";

export enum ECalloutAttributeNames {
  ICON_COLOR = "data-icon-color",
  ICON_NAME = "data-icon-name",
  EMOJI_UNICODE = "data-emoji-unicode",
  EMOJI_URL = "data-emoji-url",
  LOGO_IN_USE = "data-logo-in-use",
  BACKGROUND = "data-background",
  BLOCK_TYPE = "data-block-type",
}

export type TCalloutBlockIconAttributes = {
  [ECalloutAttributeNames.ICON_COLOR]: string | undefined;
  [ECalloutAttributeNames.ICON_NAME]: string | undefined;
};

export type TCalloutBlockEmojiAttributes = {
  [ECalloutAttributeNames.EMOJI_UNICODE]: string | undefined;
  [ECalloutAttributeNames.EMOJI_URL]: string | undefined;
};

export type TCalloutBlockAttributes = {
  [ECalloutAttributeNames.LOGO_IN_USE]: "emoji" | "icon";
  [ECalloutAttributeNames.BACKGROUND]: string | undefined;
  [ECalloutAttributeNames.BLOCK_TYPE]: "callout-component";
} & TCalloutBlockIconAttributes &
  TCalloutBlockEmojiAttributes;

export type CustomCalloutExtensionOptions = unknown;
export type CustomCalloutExtensionStorage = unknown;

export type CustomCalloutExtensionType = ProseMirrorNode<CustomCalloutExtensionOptions, CustomCalloutExtensionStorage>;
