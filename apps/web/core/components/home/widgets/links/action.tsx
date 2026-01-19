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

import { useTranslation } from "@plane/i18n";
import { PlusIcon } from "@plane/propel/icons";

type TProps = {
  onClick: () => void;
};
export function AddLink(props: TProps) {
  const { onClick } = props;
  const { t } = useTranslation();

  return (
    <button
      className="btn btn-primary flex bg-surface-1 px-4 w-[230px] h-[56px] border-[0.5px] border-subtle rounded-md gap-4"
      onClick={onClick}
    >
      <div className="rounded-sm p-2 bg-layer-1/40 w-8 h-8 my-auto">
        <PlusIcon className="h-4 w-4 stroke-2 text-tertiary" />
      </div>
      <div className="text-13 font-medium my-auto">{t("home.quick_links.add")}</div>
    </button>
  );
}
