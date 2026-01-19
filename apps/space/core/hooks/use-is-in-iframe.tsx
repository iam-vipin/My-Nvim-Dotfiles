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

import { useState, useEffect } from "react";

const useIsInIframe = () => {
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    const checkIfInIframe = () => {
      setIsInIframe(window.self !== window.top);
    };

    checkIfInIframe();
  }, []);

  return isInIframe;
};

export default useIsInIframe;
