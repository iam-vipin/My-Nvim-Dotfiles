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

import { Layers3 } from "lucide-react";
// assets
import ConfluenceLogo from "@/app/assets/services/confluence.svg?url";
import NotionLogo from "@/app/assets/services/notion.svg?url";
// components
import { UploadZip } from "@/components/importers/zip-importer";
// plane web types
import { SelectDestination } from "@/components/importers/zip-importer/steps/select-destination";
import type { TImporterStep } from "@/types/importers/zip-importer";
import { E_IMPORTER_STEPS, EZipDriverType } from "@/types/importers/zip-importer";

export const NOTION_IMPORTER_STEPS: TImporterStep[] = [
  {
    key: E_IMPORTER_STEPS.SELECT_DESTINATION,
    icon: () => <Layers3 size={14} />,
    i18n_title: "notion_importer.steps.title_select_destination",
    i18n_description: "notion_importer.steps.description_select_destination",
    component: () => <SelectDestination driverType={EZipDriverType.NOTION} logo={NotionLogo} serviceName="Notion" />,
    prevStep: undefined,
    nextStep: E_IMPORTER_STEPS.UPLOAD_ZIP,
  },
  {
    key: E_IMPORTER_STEPS.UPLOAD_ZIP,
    icon: () => <Layers3 size={14} />,
    i18n_title: "notion_importer.steps.title_upload_zip",
    i18n_description: "notion_importer.steps.description_upload_zip",
    component: () => <UploadZip driverType={EZipDriverType.NOTION} logo={NotionLogo} serviceName="Notion" />,
    prevStep: E_IMPORTER_STEPS.SELECT_DESTINATION,
    nextStep: undefined,
  },
];

export const CONFLUENCE_IMPORTER_STEPS: TImporterStep[] = [
  {
    key: E_IMPORTER_STEPS.SELECT_DESTINATION,
    icon: () => <Layers3 size={14} />,
    i18n_title: "confluence_importer.steps.title_select_destination",
    i18n_description: "confluence_importer.steps.description_select_destination",
    component: () => (
      <SelectDestination driverType={EZipDriverType.CONFLUENCE} logo={ConfluenceLogo} serviceName="Confluence" />
    ),
    prevStep: undefined,
    nextStep: E_IMPORTER_STEPS.UPLOAD_ZIP,
  },
  {
    key: E_IMPORTER_STEPS.UPLOAD_ZIP,
    icon: () => <Layers3 size={14} />,
    i18n_title: "confluence_importer.steps.title_upload_zip",
    i18n_description: "confluence_importer.steps.description_upload_zip",
    component: () => (
      <UploadZip driverType={EZipDriverType.CONFLUENCE} logo={ConfluenceLogo} serviceName="Confluence" />
    ),
    prevStep: E_IMPORTER_STEPS.SELECT_DESTINATION,
    nextStep: undefined,
  },
];
