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

import { observer } from "mobx-react";
// hooks
import type { TSelectionHelper } from "@/hooks/use-multiple-select";
import { useMultipleSelect } from "@/hooks/use-multiple-select";

type Props = {
  children: (helpers: TSelectionHelper) => React.ReactNode;
  containerRef: React.MutableRefObject<HTMLElement | null>;
  disabled?: boolean;
  entities: Record<string, string[]>; // { groupID: entityIds[] }
};

export const MultipleSelectGroup = observer(function MultipleSelectGroup(props: Props) {
  const { children, containerRef, disabled = false, entities } = props;

  const helpers = useMultipleSelect({
    containerRef,
    disabled,
    entities,
  });

  return <>{children(helpers)}</>;
});
