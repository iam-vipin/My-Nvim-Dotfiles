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
import { useState } from "react";
import { observer } from "mobx-react";
// hooks
import { useInstance } from "@/hooks/store";
// plane admin imports
import { EnterprisePlanCard } from "@/plane-admin/components/license/plans-card/enterprise";
import { useInstanceManagement } from "@/plane-admin/hooks/store/use-instance-management";
import { InstanceEnterpriseLicenseSuccessModal } from "@/plane-admin/components/license/enterprise-license-success";
// local components
import { LicenseFileSection } from "./license-file-form";
import { LicenseKeySection } from "./license-key-form";
import { EProductSubscriptionEnum } from "@plane/types";

export const EnterpriseLicenseManagement: FC = observer(function EnterpriseLicenseManagement() {
  // hooks
  const { config } = useInstance();
  const { instanceLicense } = useInstanceManagement();
  // states
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  // derived values
  const isAirgapped = config?.is_airgapped;
  const isOnEnterprisePlan = instanceLicense?.product === EProductSubscriptionEnum.ENTERPRISE;

  if (isOnEnterprisePlan) {
    return (
      <>
        <EnterprisePlanCard />
        <InstanceEnterpriseLicenseSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
        />
      </>
    );
  }

  if (isAirgapped) {
    return <LicenseFileSection onSuccess={() => setIsSuccessModalOpen(true)} />;
  }

  return <LicenseKeySection onSuccess={() => setIsSuccessModalOpen(true)} />;
});
