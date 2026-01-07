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
// plane web imports
import type { TProject } from "@/plane-web/types/projects";
// local imports
import { PriorityDropdown } from "../../../dropdowns/priority-dropdown";

type Props = {
  project: TProject;
  onClose?: () => void;
  onChange: (project: TProject, data: Partial<TProject>) => void;
  disabled: boolean;
};

export const SpreadsheetPriorityColumn = observer(function SpreadsheetPriorityColumn(props: Props) {
  const { project, onChange, disabled, onClose } = props;

  return (
    <div className="h-11 border-b-[0.5px] border-subtle-1">
      <PriorityDropdown
        value={project.priority}
        onChange={(data) => onChange(project, { priority: data })}
        disabled={disabled}
        buttonVariant="transparent-with-text"
        buttonClassName="px-4 text-left rounded-none group-[.selected-project-row]:bg-accent-primary/5 group-[.selected-project-row]:hover:bg-accent-primary/10"
        buttonContainerClassName="w-full"
        onClose={onClose}
      />
    </div>
  );
});
