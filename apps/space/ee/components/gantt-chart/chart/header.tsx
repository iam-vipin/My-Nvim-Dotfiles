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
import { Expand, Shrink } from "lucide-react";

type Props = {
  fullScreenMode: boolean;
  handleToday: () => void;
  toggleFullScreenMode: () => void;
};

export const GanttChartHeader = observer(function GanttChartHeader(props: Props) {
  const { fullScreenMode, handleToday, toggleFullScreenMode } = props;
  // chart hook

  return (
    <div className="relative flex w-full flex-shrink-0 flex-wrap items-center gap-2 whitespace-nowrap px-2.5 py-2 justify-end">
      <button type="button" className="rounded-sm p-1 px-2 text-11 hover:bg-layer-1" onClick={handleToday}>
        Today
      </button>

      <button
        type="button"
        className="flex items-center justify-center rounded-sm border border-subtle-1 p-1 transition-all hover:bg-layer-1"
        onClick={toggleFullScreenMode}
      >
        {fullScreenMode ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
      </button>
    </div>
  );
});
