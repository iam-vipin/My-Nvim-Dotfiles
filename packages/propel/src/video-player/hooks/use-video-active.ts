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

import { useEffect, useState } from "react";
import { useOutsideClickDetector } from "@plane/hooks";

type UseVideoActiveProps = {
  selected?: boolean;
  onBlur?: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
};

export const useVideoActive = ({ selected, onBlur, containerRef }: UseVideoActiveProps) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (selected) {
      setIsActive(true);
      onBlur?.();
    }
  }, [selected, onBlur]);

  useOutsideClickDetector(containerRef, () => {
    if (isActive) {
      setIsActive(false);
    }
  });

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsActive(true);
    onBlur?.();
  };

  return {
    isActive,
    setIsActive,
    handleContainerClick,
  };
};
