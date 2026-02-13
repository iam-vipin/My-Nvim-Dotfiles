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

import type { DrawioNodeViewProps } from "../components/node-view";
import type { TDrawioExtension } from "../types";
import { EDrawioAttributeNames } from "../types";

export const uploadDiagramXml = async ({
  xmlContent,
  diagramId,
  updateAttributes,
  extension,
}: {
  xmlContent: string;
  diagramId: string;
  updateAttributes: DrawioNodeViewProps["updateAttributes"];
  extension: TDrawioExtension;
}) => {
  if (!diagramId || !extension?.options.uploadDiagram) return;

  try {
    const xmlFile = new File([xmlContent], `${diagramId}.drawio`, { type: "application/xml" });
    const xmlUrl = await extension.options.uploadDiagram(`${diagramId}`, xmlFile);

    updateAttributes({
      [EDrawioAttributeNames.XML_SRC]: xmlUrl,
    });

    return { xmlUrl };
  } catch (error) {
    console.error("Error uploading diagram XML:", error);
    throw error;
  }
};

export const reuploadDiagramXml = async ({
  xmlContent,
  diagramId,
  updateAttributes,
  extension,
  xmlSrc,
}: {
  xmlContent: string;
  diagramId: string;
  updateAttributes: DrawioNodeViewProps["updateAttributes"];
  extension: TDrawioExtension;
  xmlSrc: string;
}) => {
  if (!diagramId || !extension?.options.reuploadDiagram) return;

  try {
    const xmlFile = new File([xmlContent], `${diagramId}.drawio`, { type: "application/xml" });
    const xmlUrl = await extension.options.reuploadDiagram(`${diagramId}`, xmlFile, xmlSrc);

    updateAttributes({
      [EDrawioAttributeNames.XML_SRC]: xmlUrl,
    });

    return { xmlUrl };
  } catch (error) {
    console.error("Error reuploading diagram XML:", error);
    throw error;
  }
};
