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

import type { ReactNode } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// hooks
import { useModule } from "@/hooks/store/use-module";
// types
import type { TDropdownProps } from "../types";
// local imports
import { ModuleDropdownBase } from "./base";

type TModuleDropdownProps = TDropdownProps & {
  button?: ReactNode;
  dropdownArrow?: boolean;
  dropdownArrowClassName?: string;
  projectId: string | undefined;
  showCount?: boolean;
  onClose?: () => void;
  renderByDefault?: boolean;
  itemClassName?: string;
} & (
    | {
        multiple: false;
        onChange: (val: string | null) => void;
        value: string | null;
      }
    | {
        multiple: true;
        onChange: (val: string[]) => void;
        value: string[] | null;
      }
  );

export const ModuleDropdown = observer(function ModuleDropdown(props: TModuleDropdownProps) {
  const { projectId } = props;
  // router
  const { workspaceSlug } = useParams();
  // store hooks
  const { getModuleById, getProjectModuleIds, fetchModules } = useModule();
  // derived values
  const moduleIds = projectId ? getProjectModuleIds(projectId) : [];

  const onDropdownOpen = () => {
    if (!moduleIds && projectId && workspaceSlug) fetchModules(workspaceSlug.toString(), projectId);
  };

  return (
    <ModuleDropdownBase
      {...props}
      getModuleById={getModuleById}
      moduleIds={moduleIds ?? []}
      onDropdownOpen={onDropdownOpen}
    />
  );
});
