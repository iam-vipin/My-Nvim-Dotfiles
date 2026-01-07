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

// local imports
import { MovePageModalListItem } from "./list-item";
import type { TMovePageModalListItem } from "./list-item";

type Props = {
  getItemDetails: (itemValue: string) => TMovePageModalListItem | null;
  items: string[];
  title: string;
};

export function MovePageModalListSection(props: Props) {
  const { getItemDetails, items, title } = props;

  return (
    <section className="px-2 space-y-2">
      <p className="text-11 text-tertiary font-semibold px-1 py-0.5 tracking-wide">{title}</p>
      <ul className="text-primary space-y-2">
        {items.map((itemValue) => {
          const item = getItemDetails(itemValue);
          if (!item) return null;
          return <MovePageModalListItem key={itemValue} item={item} />;
        })}
      </ul>
    </section>
  );
}
