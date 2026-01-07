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

function Typing() {
  return (
    <>
      <span className="dot animate-bounce" style={{ animationDelay: "0s" }}>
        .
      </span>
      <span className="dot animate-bounce" style={{ animationDelay: "0.2s" }}>
        .
      </span>
      <span className="dot animate-bounce" style={{ animationDelay: "0.4s" }}>
        .
      </span>
    </>
  );
}

export default Typing;
