import { useState } from "react";
import { observer } from "mobx-react";
import { CircleAlert, CircleCheck, RefreshCw } from "lucide-react";
import { Button } from "@plane/propel/button";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
// plane imports
import { AlertModalCore } from "@plane/ui";
import { cn, getSubscriptionName } from "@plane/utils";
// hooks
import { useInstanceManagement } from "@/plane-admin/hooks/store/use-instance-management";

type TInstanceLicenseActionsProps = {
  showSyncButton?: boolean;
  showDeactivateButton?: boolean;
};

type TLicenseSyncStatus = "synced" | "syncing" | "success" | "error";

export const InstanceLicenseActions = observer(function InstanceLicenseActions(props: TInstanceLicenseActionsProps) {
  const { showSyncButton = true, showDeactivateButton = true } = props;
  // states
  const [licenseSyncStatus, setLicenseSyncStatus] = useState<TLicenseSyncStatus>("synced");
  const [isDeactivationModalOpen, setIsDeactivationModalOpen] = useState<boolean>(false);
  const [isDeactivating, setIsDeactivating] = useState<boolean>(false);
  // store hooks
  const { instanceLicense, syncLicense, deactivateLicense } = useInstanceManagement();
  // derived values
  const isSelfManaged = instanceLicense?.is_self_managed;
  const product = instanceLicense?.product;
  const planName = product && getSubscriptionName(product);

  const handleSyncLicense = () => {
    setLicenseSyncStatus("syncing");
    syncLicense()
      .then(() => {
        setLicenseSyncStatus("success");
      })
      .catch(() => {
        setLicenseSyncStatus("error");
      })
      .finally(() => {
        setTimeout(() => {
          setLicenseSyncStatus("synced");
        }, 3000);
      });
  };

  const handleDeactivation = () => {
    setIsDeactivating(true);
    deactivateLicense()
      .then(() => {
        setIsDeactivationModalOpen(false);
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success",
          message: "License deactivated successfully.",
        });
      })
      .catch(() => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: "Error",
          message: "Failed to deactivate license. Please try again.",
        });
      })
      .finally(() => {
        setIsDeactivating(false);
      });
  };

  if (!isSelfManaged) return null;
  return (
    <div className="flex w-full items-center pt-3 gap-2">
      {showSyncButton && (
        <Button variant="secondary" onClick={handleSyncLicense} disabled={licenseSyncStatus !== "synced"}>
          {licenseSyncStatus === "synced" && "Sync plan"}
          {licenseSyncStatus === "syncing" && (
            <>
              <RefreshCw size={10} className={cn("flex-shrink-0 mt-0.5 animate-spin transition-all duration-700")} />
              Syncing
            </>
          )}
          {licenseSyncStatus === "success" && (
            <>
              <CircleCheck
                size={10}
                className="flex-shrink-0 mt-0.5 transition-all duration-300 animate-in zoom-in-50"
              />
              Synced
            </>
          )}
          {licenseSyncStatus === "error" && (
            <>
              <CircleAlert
                size={10}
                className="flex-shrink-0 mt-0.5 transition-all duration-300 animate-in zoom-in-50"
              />
              Sync error
            </>
          )}
        </Button>
      )}
      {showDeactivateButton && (
        <>
          <AlertModalCore
            handleClose={() => setIsDeactivationModalOpen(false)}
            handleSubmit={handleDeactivation}
            isSubmitting={isDeactivating}
            isOpen={isDeactivationModalOpen}
            title="Delink license key"
            content={
              <>
                All <span className="font-medium">{planName}</span> features will stop working when you do this. Proceed
                to reactivate this instance with another license key or downgrade to the Free plan.
              </>
            }
            secondaryButtonText="Cancel"
            primaryButtonText={{
              loading: "Delinking",
              default: "Delink",
            }}
          />
          <Button variant="error-outline" onClick={() => setIsDeactivationModalOpen(true)}>
            Delink license key
          </Button>
        </>
      )}
    </div>
  );
});
