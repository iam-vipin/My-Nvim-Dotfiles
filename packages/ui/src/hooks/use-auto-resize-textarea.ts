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

import { useLayoutEffect } from "react";

export const useAutoResizeTextArea = (
  textAreaRef: React.RefObject<HTMLTextAreaElement>,
  value: string | number | readonly string[]
) => {
  useLayoutEffect(() => {
    const textArea = textAreaRef.current;
    if (!textArea) return;

    // We need to reset the height momentarily to get the correct scrollHeight for the textarea
    textArea.style.height = "0px";
    const scrollHeight = textArea.scrollHeight;
    textArea.style.height = scrollHeight + "px";
  }, [textAreaRef, value]);
};
