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

type EmbedUrlModifier = {
  match: (url: string) => boolean;
  modify: (url: string) => string;
};

const embedUrlModifiers: Record<string, EmbedUrlModifier> = {
  figma: {
    match: (url) => url.includes("www.figma.com"),
    modify: (url) => {
      let modifiedUrl = url.replace("www.figma.com", "embed.figma.com");
      if (!modifiedUrl.includes("embed-host=")) {
        modifiedUrl += modifiedUrl.includes("?") ? "&embed-host=share" : "?embed-host=share";
      }
      return modifiedUrl;
    },
  },
};

export const useModifiedEmbedUrl = ({ url }: { url: string }) => {
  // Find the first matching modifier and apply it, or return the original URL
  const modifier = Object.values(embedUrlModifiers).find((mod) => mod.match(url));
  return modifier ? modifier.modify(url) : url;
};
