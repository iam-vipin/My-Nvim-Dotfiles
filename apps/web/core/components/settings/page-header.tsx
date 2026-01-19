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

import { Header } from "@plane/ui";

type Props = {
  leftItem?: React.ReactNode;
  rightItem?: React.ReactNode;
};

export function SettingsPageHeader(props: Props) {
  const { leftItem, rightItem } = props;

  return (
    <Header>
      {leftItem && <Header.LeftItem>{leftItem}</Header.LeftItem>}
      {rightItem && <Header.RightItem>{rightItem}</Header.RightItem>}
    </Header>
  );
}
