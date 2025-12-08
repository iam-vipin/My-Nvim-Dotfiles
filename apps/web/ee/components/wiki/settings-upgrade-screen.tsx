// plane imports
import { LICENSE_TRACKER_EVENTS } from "@plane/constants";
import { Tabs } from "@plane/propel/tabs";
import { Button } from "@plane/ui";
// helpers
import { captureView } from "@/helpers/event-tracker.helper";
// plane web imports
import { useWorkspaceSubscription } from "@/plane-web/hooks/store";
// local imports
import { PaidPlanUpgradeModal } from "../license/modal/upgrade-modal";

type Props = {
  workspaceSlug: string;
};

const TABS_LIST = [
  {
    key: "nested-pages",
    title: "Nested Pages",
  },
  {
    key: "add-embed",
    title: "Add embed",
  },
  {
    key: "publish",
    title: "Publish pages",
  },
  {
    key: "comments",
    title: "Comments",
  },
];

export function WikiSettingsUpgradeScreen(props: Props) {
  const { workspaceSlug } = props;
  // hooks
  const { isPaidPlanModalOpen, togglePaidPlanModal } = useWorkspaceSubscription();

  const handlePaidPlanPurchaseModalOpen = () => {
    togglePaidPlanModal(true);
    captureView({
      elementName: LICENSE_TRACKER_EVENTS.purchase_modal_opened,
    });
  };

  return (
    <>
      <PaidPlanUpgradeModal isOpen={isPaidPlanModalOpen} handleClose={() => togglePaidPlanModal(false)} />
      <div>
        <div>
          <h2 className="text-2xl font-semibold">Upgrade to unlock Wiki</h2>
          <p className="mt-3 text-custom-text-200">
            Unlock public pages, version history, shared pages, real-time collaboration, and workspace pages for wikis,
            company-wide docs, and knowledge bases with Plane Pro.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Button variant="primary" size="sm" onClick={handlePaidPlanPurchaseModalOpen}>
              Upgrade
            </Button>
            <Button variant="neutral-primary" size="sm">
              Learn more
            </Button>
          </div>
        </div>
        <div className="mt-10">
          <div>
            <Tabs>
              <Tabs.List>
                {TABS_LIST.map((tab) => (
                  <Tabs.Trigger key={tab.key} value={tab.key}>
                    {tab.title}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              {TABS_LIST.map((tab) => (
                <Tabs.Content key={tab.key} value={tab.key}>
                  {tab.title}
                </Tabs.Content>
              ))}
            </Tabs>
          </div>
          <div className="mt-6">Images go here</div>
        </div>
      </div>
    </>
  );
}
