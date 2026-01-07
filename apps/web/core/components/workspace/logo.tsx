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
// plane imports
import { useTranslation } from "@plane/i18n";
import { cn, getFileURL } from "@plane/utils";

type Props = {
  logo: string | null | undefined;
  name: string | undefined;
  classNames?: string;
};

export const WorkspaceLogo = observer(function WorkspaceLogo(props: Props) {
  // translation
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        `relative grid h-6 w-6 flex-shrink-0 place-items-center uppercase ${
          !props.logo && "rounded-md bg-accent-primary text-on-color"
        } ${props.classNames ? props.classNames : ""}`
      )}
    >
      {props.logo && props.logo !== "" ? (
        <img
          src={getFileURL(props.logo)}
          className="absolute left-0 top-0 h-full w-full rounded-md object-cover"
          alt={t("aria_labels.projects_sidebar.workspace_logo")}
        />
      ) : (
        (props.name?.[0] ?? "...")
      )}
    </div>
  );
});
