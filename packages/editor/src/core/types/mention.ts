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

// plane types
import type { TSearchEntities } from "@plane/types";

export type TMentionSuggestion = {
  entity_identifier: string;
  entity_name: TSearchEntities;
  icon: React.ReactNode;
  id: string;
  subTitle?: string;
  title: string;
};

export type TMentionSection = {
  key: string;
  title?: string;
  items: TMentionSuggestion[];
};

export type TCallbackMentionComponentProps = Pick<TMentionSuggestion, "entity_identifier" | "entity_name">;

export type TMentionHandler = {
  getMentionedEntityDetails?: (entity_identifier: string) => { display_name: string } | undefined;
  renderComponent: (props: TCallbackMentionComponentProps) => React.ReactNode;
  searchCallback?: (query: string) => Promise<TMentionSection[]>;
};
