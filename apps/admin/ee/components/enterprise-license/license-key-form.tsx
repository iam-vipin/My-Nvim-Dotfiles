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

import type { FC, FormEvent } from "react";
import { useState } from "react";
import { observer } from "mobx-react";
// plane imports
import { Button } from "@plane/propel/button";
import { Input } from "@plane/ui";
// hooks
import { useInstanceManagement } from "@/plane-admin/hooks/store/use-instance-management";
// components
import { LicenseCardWrapper } from "./license-card-wrapper";

type TLicenseKeyFormProps = {
  onSuccess: () => void;
};

export const LicenseKeySection: FC<TLicenseKeyFormProps> = observer(function LicenseKeySection(
  props: TLicenseKeyFormProps
) {
  const { onSuccess } = props;
  // hooks
  const { activateUsingLicenseKey } = useInstanceManagement();
  // states
  const [activationLoader, setActivationLoader] = useState<boolean>(false);
  const [licenseKey, setLicenseKey] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);

  const handleLicenseKeyChange = (event: FormEvent<HTMLInputElement>) => {
    setError(undefined);
    setLicenseKey(event.currentTarget.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!licenseKey || licenseKey.length <= 0) {
      const errorMessage = "Please enter a valid license key";
      setError(errorMessage);
      return;
    }

    try {
      setActivationLoader(true);
      await activateUsingLicenseKey(licenseKey);
      onSuccess();
      setLicenseKey("");
    } catch (error: any) {
      const errorMessage =
        error?.error ?? "Your license is invalid or already in use. For any queries contact support@plane.so";
      setError(errorMessage);
    } finally {
      setActivationLoader(false);
    }
  };

  return (
    <LicenseCardWrapper
      description={
        <>
          <p>If you possess an enterprise plan, please enter your license key to activate it here.</p>
          <p>This activation will apply to all workspaces within this instance.</p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Input
              id="license-key"
              type="text"
              name="license-key"
              placeholder="License key"
              value={licenseKey}
              onChange={handleLicenseKeyChange}
              hasError={Boolean(error)}
              className="w-full bg-layer-2"
              autoFocus
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={activationLoader}
              disabled={!licenseKey || activationLoader}
            >
              {activationLoader ? "Activating" : "Activate"}
            </Button>
          </div>
          {error && <div className="text-caption-sm-medium text-danger-secondary">{error}</div>}
        </div>
      </form>
    </LicenseCardWrapper>
  );
});
