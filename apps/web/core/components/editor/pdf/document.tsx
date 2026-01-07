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

import type { PageProps } from "@react-pdf/renderer";
import { Document, Font, Page } from "@react-pdf/renderer";
import { Html } from "react-pdf-html";
// assets
import interBold from "@/app/assets/fonts/inter/bold.ttf?url";
import interHeavy from "@/app/assets/fonts/inter/heavy.ttf?url";
import interLight from "@/app/assets/fonts/inter/light.ttf?url";
import interMedium from "@/app/assets/fonts/inter/medium.ttf?url";
import interRegular from "@/app/assets/fonts/inter/regular.ttf?url";
import interSemibold from "@/app/assets/fonts/inter/semibold.ttf?url";
import interThin from "@/app/assets/fonts/inter/thin.ttf?url";
import interUltraBold from "@/app/assets/fonts/inter/ultrabold.ttf?url";
import interUltraLight from "@/app/assets/fonts/inter/ultralight.ttf?url";
// constants
import { EDITOR_PDF_DOCUMENT_STYLESHEET } from "@/constants/editor";

Font.register({
  family: "Inter",
  fonts: [
    { src: interThin, fontWeight: "thin" },
    { src: interThin, fontWeight: "thin", fontStyle: "italic" },
    { src: interUltraLight, fontWeight: "ultralight" },
    { src: interUltraLight, fontWeight: "ultralight", fontStyle: "italic" },
    { src: interLight, fontWeight: "light" },
    { src: interLight, fontWeight: "light", fontStyle: "italic" },
    { src: interRegular, fontWeight: "normal" },
    { src: interRegular, fontWeight: "normal", fontStyle: "italic" },
    { src: interMedium, fontWeight: "medium" },
    { src: interMedium, fontWeight: "medium", fontStyle: "italic" },
    { src: interSemibold, fontWeight: "semibold" },
    { src: interSemibold, fontWeight: "semibold", fontStyle: "italic" },
    { src: interBold, fontWeight: "bold" },
    { src: interBold, fontWeight: "bold", fontStyle: "italic" },
    { src: interUltraBold, fontWeight: "ultrabold" },
    { src: interUltraBold, fontWeight: "ultrabold", fontStyle: "italic" },
    { src: interHeavy, fontWeight: "heavy" },
    { src: interHeavy, fontWeight: "heavy", fontStyle: "italic" },
  ],
});

type Props = {
  content: string;
  pageFormat: PageProps["size"];
};

export function PDFDocument(props: Props) {
  const { content, pageFormat } = props;

  return (
    <Document>
      <Page
        size={pageFormat}
        style={{
          backgroundColor: "#ffffff",
          padding: 64,
        }}
      >
        <Html stylesheet={EDITOR_PDF_DOCUMENT_STYLESHEET}>{content}</Html>
      </Page>
    </Document>
  );
}
