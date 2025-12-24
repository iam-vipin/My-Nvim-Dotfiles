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
