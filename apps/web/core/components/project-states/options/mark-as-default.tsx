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

import { useState } from "react";
import { observer } from "mobx-react";
// plane imports
import type { TStateOperationsCallbacks } from "@plane/types";
import { cn } from "@plane/utils";

type TStateMarksAsDefault = {
  stateId: string;
  isDefault: boolean;
  markStateAsDefaultCallback: TStateOperationsCallbacks["markStateAsDefault"];
};

export const StateMarksAsDefault = observer(function StateMarksAsDefault(props: TStateMarksAsDefault) {
  const { stateId, isDefault, markStateAsDefaultCallback } = props;
  // states
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsDefault = async () => {
    if (!stateId || isDefault) return;
    setIsLoading(true);

    try {
      setIsLoading(false);
      await markStateAsDefaultCallback(stateId);
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={cn(
        "text-11 whitespace-nowrap transition-colors",
        isDefault ? "text-tertiary" : "text-secondary hover:text-primary"
      )}
      disabled={isDefault || isLoading}
      onClick={handleMarkAsDefault}
    >
      {isLoading ? "Marking as default" : isDefault ? `Default` : `Mark as default`}
    </button>
  );
});
