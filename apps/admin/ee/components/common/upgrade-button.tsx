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
import { useNavigate } from "react-router";
// plane internal packages
import { WEB_BASE_URL } from "@plane/constants";
import { Button } from "@plane/propel/button";
import { AlertModalCore } from "@plane/ui";

type TAuthUpgradeButtonProps = {
  level: "workspace" | "instance";
};

export function UpgradeButton(props: TAuthUpgradeButtonProps) {
  const { level } = props;
  // hooks
  const navigate = useNavigate();
  // states
  const [isActivationModalOpen, setIsActivationModalOpen] = React.useState(false);
  // derived values
  const redirectionLink = encodeURI(WEB_BASE_URL + "/");

  const handleActivationModalSubmit = () => {
    if (level === "instance") {
      void navigate("/billing/");
    } else {
      window.open(redirectionLink, "_blank");
    }
    setIsActivationModalOpen(false);
  };

  return (
    <>
      <AlertModalCore
        variant="primary"
        isOpen={isActivationModalOpen}
        handleClose={() => setIsActivationModalOpen(false)}
        handleSubmit={handleActivationModalSubmit}
        isSubmitting={false}
        title={level === "workspace" ? "Activate workspace" : "Activate instance"}
        content={
          level === "workspace"
            ? "Activate any of your workspace to get this feature."
            : "Activate your instance with an enterprise license to get this feature."
        }
        primaryButtonText={{
          loading: "Redirecting",
          default: "Go to Billing",
        }}
        secondaryButtonText="Close"
      />
      <Button variant="primary" size="sm" onClick={() => setIsActivationModalOpen(true)}>
        Activate {level === "workspace" ? "workspace" : "instance"}
      </Button>
    </>
  );
}
