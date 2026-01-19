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
// helpers
import type { TCustomComponentsMetaData } from "@plane/utils";
// helpers
import { getEditorAssetSrc } from "@/helpers/editor.helper";
// hooks
import { useMember } from "@/hooks/store/use-member";

type TArgs = {
  anchor: string;
};

export const useParseEditorContent = (args: TArgs) => {
  const { anchor } = args;
  // store hooks
  const { getMemberById } = useMember();

  const getEditorMetaData = useCallback(
    (htmlContent: string): TCustomComponentsMetaData => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      const filesMetaData: TCustomComponentsMetaData["file_assets"] = [];
      // process image components
      const imageComponents = doc.querySelectorAll("image-component");
      imageComponents.forEach((element) => {
        const src = element.getAttribute("src");
        if (src) {
          const assetSrc = src.startsWith("http") ? src : getEditorAssetSrc(anchor, src);
          if (assetSrc) {
            filesMetaData.push({
              id: src,
              name: src,
              url: assetSrc,
            });
          }
        }
      });
      // process user mentions
      const userMentions: TCustomComponentsMetaData["user_mentions"] = [];
      const mentionComponents = doc.querySelectorAll("mention-component");
      mentionComponents.forEach((element) => {
        const id = element.getAttribute("entity_identifier");
        if (id) {
          const userDetails = getMemberById(id);
          const originUrl = typeof window !== "undefined" && (window.location.origin ?? "");
          const path = `profile/${id}`;
          const url = `${originUrl}/${path}`;
          if (userDetails) {
            userMentions.push({
              id,
              display_name: userDetails.member__display_name,
              url,
            });
          }
        }
      });
      // process attachment components
      const attachmentComponents = doc.querySelectorAll("attachment-component");
      attachmentComponents.forEach((element) => {
        const src = element.getAttribute("src");
        const name = element.getAttribute("data-name") || "";
        if (src) {
          const assetSrc = src.startsWith("http") ? src : getEditorAssetSrc(anchor, src);
          if (assetSrc) {
            filesMetaData.push({
              id: src,
              name,
              url: assetSrc,
            });
          }
        }
      });

      return {
        file_assets: filesMetaData,
        user_mentions: userMentions,
      };
    },
    [anchor, getMemberById]
  );

  return {
    getEditorMetaData,
  };
};
