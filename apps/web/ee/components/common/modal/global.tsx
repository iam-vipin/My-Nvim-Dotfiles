import { lazy, Suspense } from "react";
import { observer } from "mobx-react";
// plane web hooks
import { useSelfHostedSubscription, useWorkspaceSubscription } from "@/plane-web/hooks/store";

// Lazy load modal components
const PaidPlanSuccessModal = lazy(() =>
  import("@/plane-web/components/license").then((module) => ({ default: module.PaidPlanSuccessModal }))
);
const PaidPlanUpgradeModal = lazy(() =>
  import("@/plane-web/components/license").then((module) => ({ default: module.PaidPlanUpgradeModal }))
);
const SubscriptionActivationModal = lazy(() =>
  import("@/plane-web/components/license/activation/modal").then((module) => ({
    default: module.SubscriptionActivationModal,
  }))
);
const AddSeatsModal = lazy(() =>
  import("@/plane-web/components/workspace/billing/manage-seats").then((module) => ({ default: module.AddSeatsModal }))
);
const RemoveUnusedSeatsModal = lazy(() =>
  import("@/plane-web/components/workspace/billing/manage-seats").then((module) => ({
    default: module.RemoveUnusedSeatsModal,
  }))
);

type TGlobalModalsProps = {
  workspaceSlug: string;
};

/**
 * GlobalModals component manages all workspace-level modals across Plane applications.
 *
 * This includes:
 * - Subscription and license management modals (upgrade, activation, success)
 * - Workspace seat management modals (add seats, remove unused seats)
 *
 * These modals are available across all Plane applications (Project, Wiki, AI, and Settings).
 */
export const GlobalModals = observer(function GlobalModals(props: TGlobalModalsProps) {
  const { workspaceSlug } = props;
  // store hooks
  const {
    isSeatManagementEnabled,
    addWorkspaceSeatsModal,
    removeUnusedSeatsConfirmationModal,
    toggleAddWorkspaceSeatsModal,
    toggleRemoveUnusedSeatsConfirmationModal,
    isSuccessPlanModalOpen,
    handleSuccessModalToggle,
  } = useWorkspaceSubscription();
  const { subscribedPlan, isPaidPlanModalOpen, togglePaidPlanModal } = useWorkspaceSubscription();
  const { isActivationModalOpen, toggleLicenseActivationModal } = useSelfHostedSubscription();
  // derived values
  const subscriptionDetail = subscribedPlan[workspaceSlug];

  return (
    <Suspense fallback={null}>
      {subscriptionDetail?.product && (
        <PaidPlanSuccessModal
          variant={subscriptionDetail?.product}
          isOpen={isSuccessPlanModalOpen}
          handleClose={() => handleSuccessModalToggle(false)}
        />
      )}
      <SubscriptionActivationModal
        isOpen={isActivationModalOpen}
        handleClose={() => toggleLicenseActivationModal(false)}
      />
      <PaidPlanUpgradeModal isOpen={isPaidPlanModalOpen} handleClose={() => togglePaidPlanModal(false)} />
      {isSeatManagementEnabled && (
        <AddSeatsModal
          data={addWorkspaceSeatsModal}
          onClose={() => {
            toggleAddWorkspaceSeatsModal({ isOpen: false });
          }}
        />
      )}
      {isSeatManagementEnabled && (
        <RemoveUnusedSeatsModal
          workspaceSlug={workspaceSlug}
          isOpen={removeUnusedSeatsConfirmationModal}
          handleClose={() => toggleRemoveUnusedSeatsConfirmationModal()}
        />
      )}
    </Suspense>
  );
});
