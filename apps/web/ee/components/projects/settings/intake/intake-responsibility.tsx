import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ChevronDownIcon } from "lucide-react";
// plane imports
import { E_FEATURE_FLAGS } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { MembersPropertyIcon } from "@plane/propel/icons";
import { setPromiseToast } from "@plane/propel/toast";
import { EProductSubscriptionEnum } from "@plane/types";
import { getSubscriptionTextAndBackgroundColor } from "@plane/ui";
import { cn, getSubscriptionName } from "@plane/utils";
// components
import { MemberDropdown } from "@/components/dropdowns/member/dropdown";
// plane web imports
import type { TIntakeResponsibilityList } from "@/plane-web/constants/project/settings/features";
import { useFlag } from "@/plane-web/hooks/store/use-flag";
import { useIntakeResponsibility } from "@/plane-web/hooks/store/use-intake-responsibility";
import { useWorkspaceSubscription } from "@/plane-web/hooks/store/use-workspace-subscription";

type Props = {
  projectId?: string;
  featureList: TIntakeResponsibilityList;
};

const IntakeResponsibility = observer((props: Props) => {
  const { projectId, featureList } = props;
  const { workspaceSlug } = useParams();
  //   hooks
  const { t } = useTranslation();
  // store hooks
  const { getAssignees, fetchIntakeAssignees, updateIntakeAssignees } = useIntakeResponsibility();
  const { togglePaidPlanModal } = useWorkspaceSubscription();

  const assignees = projectId ? getAssignees(projectId) : [];
  /**Fetch intake assignee */
  useSWR(
    workspaceSlug && projectId ? `INTAKE_ASSIGNEE_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchIntakeAssignees(workspaceSlug.toString(), projectId.toString()) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  if (!workspaceSlug || !projectId) return null;

  // Derived Values
  const isResponsibilityEnabled = useFlag(workspaceSlug?.toString(), E_FEATURE_FLAGS.INTAKE_RESPONSIBILITY);

  const intakeT = (path: string) => t(`project_settings.features.intake.${path}`);

  const handleAssigneeChange = async (val: string[]) => {
    if (!workspaceSlug || !projectId) return;

    const updatePromise = updateIntakeAssignees(workspaceSlug, projectId, { users: val });

    setPromiseToast(updatePromise, {
      loading: intakeT("toasts.set.loading"),
      success: {
        title: intakeT("toasts.set.success.title"),
        message: () => intakeT("toasts.set.success.message"),
      },
      error: {
        title: intakeT("toasts.set.error.title"),
        message: () => intakeT("toasts.set.error.message"),
      },
    });
  };

  return (
    <>
      <h4 className="pt-4 mt-4 mb-2 text-sm font-medium text-custom-text-300">{intakeT("heading")}</h4>
      <div className="px-4 rounded border transition-all border-custom-border-200 bg-custom-background-90">
        {Object.entries(featureList).map(([featureKey, feature]) => (
          <div key={featureKey} className={cn("gap-y-3 gap-x-8 py-3 bg-custom-background-90")}>
            <div key={featureKey} className={cn("flex gap-2 justify-between", {})}>
              <div className="flex gap-2 w-full">
                <div className="flex justify-center mt-1 rounded">{feature.icon}</div>
                <div className="w-full">
                  <div className={cn("flex gap-2 justify-between", {})}>
                    <div className="flex-1 w-full">
                      <div className="flex gap-2">
                        <div className="text-sm font-medium leading-5 align-top">{intakeT(`${featureKey}.title`)}</div>
                        {!isResponsibilityEnabled && (
                          <div
                            className={cn(
                              "rounded bg-custom-background-80 px-2 py-[1px] text-xs font-medium text-custom-text-300 capitalize items-center",
                              getSubscriptionTextAndBackgroundColor(EProductSubscriptionEnum.BUSINESS)
                            )}
                          >
                            <h1>{getSubscriptionName(EProductSubscriptionEnum.BUSINESS)}</h1>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-custom-text-300 text-wrap">
                        {intakeT(`${featureKey}.description`)}
                      </p>
                    </div>
                    <div className="flex items-center h-8 max-w-40">
                      {isResponsibilityEnabled ? (
                        <MemberDropdown
                          value={assignees}
                          onChange={handleAssigneeChange}
                          projectId={projectId}
                          placeholder={t("no_assignee")}
                          multiple
                          showUserDetails
                          buttonVariant="border-with-text"
                          className="w-full"
                          buttonContainerClassName="w-full text-left"
                          buttonClassName={assignees.length > 0 ? "hover:bg-transparent" : ""}
                          dropdownArrow
                        />
                      ) : (
                        <button
                          type="button"
                          className="block w-full max-w-full h-full text-left opacity-30 cursor-pointer outline-none clickable"
                          onClick={() => togglePaidPlanModal(true)}
                        >
                          <div className="h-full w-full flex items-center gap-1.5 border-[0.5px] border-custom-border-300 hover:bg-custom-background-80 rounded px-2 py-0.5 text-xs">
                            <MembersPropertyIcon className={cn("flex-shrink-0 w-3 h-3 mx-[4px]")} />
                            <span className="flex-grow leading-5 truncate">{t("no_assignee")}</span>
                            <ChevronDownIcon className="h-2.5 w-2.5 flex-shrink-0" aria-hidden="true" />
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
});

export default IntakeResponsibility;
