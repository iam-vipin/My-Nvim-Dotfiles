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

// plane imports
import { EXTENDED_OPERATORS } from "@plane/types";
// ce imports
import type {
  TFiltersOperatorConfigs,
  TUseFiltersOperatorConfigsProps,
} from "@/ce/hooks/rich-filters/use-filters-operator-configs";
import { useFiltersOperatorConfigs as useCoreFiltersOperatorConfigs } from "@/ce/hooks/rich-filters/use-filters-operator-configs";
// plane web imports
import { useFlag } from "@/plane-web/hooks/store/use-flag";

export const useFiltersOperatorConfigs = (props: TUseFiltersOperatorConfigsProps): TFiltersOperatorConfigs => {
  const { workspaceSlug } = props;
  // derived values
  const isRichFiltersEnabled = useFlag(workspaceSlug, "RICH_FILTERS");
  const coreOperatorConfig = useCoreFiltersOperatorConfigs(props);

  if (!isRichFiltersEnabled) {
    return coreOperatorConfig;
  }

  return {
    allowedOperators: new Set([...coreOperatorConfig.allowedOperators, ...Object.values(EXTENDED_OPERATORS)]),
    allowNegative: true,
  };
};
