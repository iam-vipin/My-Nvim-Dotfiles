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

import { Command } from "cmdk";
import { useTranslation } from "@plane/i18n";
import { SearchIcon } from "@plane/propel/icons";
// plane imports
// components
import type { TPowerKContext } from "@/components/power-k/core/types";
// plane web imports
import { PowerKModalCommandItem } from "@/components/power-k/ui/modal/command-item";

export type TPowerKModalNoSearchResultsCommandProps = {
  context: TPowerKContext;
  searchTerm: string;
  updateSearchTerm: (value: string) => void;
};

export function PowerKModalNoSearchResultsCommand(props: TPowerKModalNoSearchResultsCommandProps) {
  const { updateSearchTerm } = props;
  // translation
  const { t } = useTranslation();

  return (
    <Command.Group>
      <PowerKModalCommandItem
        icon={SearchIcon}
        value="no-results"
        label={
          <p className="flex items-center gap-2">
            {t("power_k.search_menu.no_results")}{" "}
            <span className="shrink-0 text-13 text-tertiary">{t("power_k.search_menu.clear_search")}</span>
          </p>
        }
        onSelect={() => updateSearchTerm("")}
      />
    </Command.Group>
  );
}
