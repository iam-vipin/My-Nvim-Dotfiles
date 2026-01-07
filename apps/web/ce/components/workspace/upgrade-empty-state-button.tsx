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

import type { FC } from "react";
import { getButtonStyling } from "@plane/propel/button";

type TUpgradeEmptyStateButtonProps = {
  workspaceSlug: string;
};

export function UpgradeEmptyStateButton(_props: TUpgradeEmptyStateButtonProps) {
  return (
    <a
      className={`${getButtonStyling("primary", "base")} cursor-pointer`}
      href="https://ece39166.sibforms.com/serve/MUIFAPPLJk02NaZT7ZOinKdoKPL351GVFpEmit1jpJixcLlqd3TaulIT9Czmu0yDy_5bqzuVmEu6Y6oUc09X2NIhI88jplFs0G6ARQa6NxHxACHAUtKNQhOmyI7zpC4MLV_E3kkwlwbzguZyKKURADedKgRarGu77LFz6f9CH-DUDntNbrooJhU1-vndV1EyWNrFgvjMDjz2wSat"
      target="_blank"
      rel="noreferrer"
    >
      Stay in loop
    </a>
  );
}
