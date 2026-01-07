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

import React from "react";
// ui
import { Button } from "@plane/propel/button";
import { CopyIcon } from "@plane/propel/icons";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";

type Props = {
  label: string;
  url: string;
  description: string | React.ReactNode;
};

export type TCopyField = {
  key: string;
  label: string;
  url: string;
  description: string | React.ReactNode;
};

export function CopyField(props: Props) {
  const { label, url, description } = props;

  return (
    <div className="flex flex-col gap-1">
      <h4 className="text-13 text-secondary">{label}</h4>
      <Button
        variant="secondary"
        size="lg"
        className="flex items-center justify-between py-2"
        onClick={() => {
          navigator.clipboard.writeText(url);
          setToast({
            type: TOAST_TYPE.INFO,
            title: "Copied to clipboard",
            message: `The ${label} has been successfully copied to your clipboard`,
          });
        }}
      >
        <p className="text-13 font-medium">{url}</p>
        <CopyIcon width={18} height={18} color="#B9B9B9" />
      </Button>
      <div className="text-11 text-tertiary">{description}</div>
    </div>
  );
}
