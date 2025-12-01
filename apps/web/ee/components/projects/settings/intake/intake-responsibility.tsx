import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import useSWR from "swr";
// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { setPromiseToast } from "@plane/propel/toast";
import { Tooltip } from "@plane/propel/tooltip";
import { EProductSubscriptionEnum, EUserProjectRoles } from "@plane/types";
import { getSubscriptionTextAndBackgroundColor } from "@plane/ui";
import { cn, getSubscriptionName } from "@plane/utils";
// ce imports
import { MemberDropdown } from "@/components/dropdowns/member/dropdown";
import { useUserPermissions } from "@/hooks/store/user";
import { PaidPlanUpgradeModal } from "@/plane-web/components/license";
import type { TIntakeResponsibilityList } from "@/plane-web/constants/project/settings/features";
// hooks
import { useIntakeResponsibility } from "@/plane-web/hooks/store/use-intake-responsibility";
// plane web imports
// components

type Props = {
  projectId?: string;
  featureList: TIntakeResponsibilityList;
  upgradePlan: boolean;
};
const IntakeResponsibility = observer((props: Props) => {
  const { projectId, featureList, upgradePlan } = props;
  const { workspaceSlug } = useParams();
  //   hooks
  const { allowPermissions } = useUserPermissions();
  const { t } = useTranslation();
  // store hooks
  const { getAssignee, fetchIntakeAssignee, createIntakeAssignee, deleteIntakeAssignee } = useIntakeResponsibility();
  //   state
  const [isPaidPlanModalOpen, togglePaidPlanModal] = useState(false);

  const assignee = projectId ? getAssignee(projectId) : null;
  /**Fetch intake assignee */
  useSWR(
    workspaceSlug && projectId ? `INTAKE_ASSIGNEE_${workspaceSlug}_${projectId}` : null,
    workspaceSlug && projectId ? () => fetchIntakeAssignee(workspaceSlug.toString(), projectId.toString()) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  if (!workspaceSlug || !projectId) return null;

  // Derived Values
  const isAdmin = allowPermissions(
    [EUserProjectRoles.ADMIN],
    EUserPermissionsLevel.PROJECT,
    workspaceSlug.toString(),
    projectId
  );

  const intakeT = (path: string) => t(`project_settings.features.intake.${path}`);

  const handleAssigneeChange = async (val: string | null) => {
    if (!workspaceSlug || !projectId) return;

    const currentAssignee = assignee;
    let updatePromise: Promise<void>;

    // If clicking on the already selected assignee or clearing (setting to null), remove it
    if (val === null || (val === currentAssignee && currentAssignee !== null)) {
      if (!currentAssignee) return;

      updatePromise = deleteIntakeAssignee(workspaceSlug, projectId, currentAssignee);

      setPromiseToast(updatePromise, {
        loading: intakeT("toasts.remove.loading"),
        success: {
          title: intakeT("toasts.remove.success.title"),
          message: () => intakeT("toasts.remove.success.message"),
        },
        error: {
          title: intakeT("toasts.remove.error.title"),
          message: () => intakeT("toasts.remove.error.message"),
        },
      });
      return;
    }
    // Create new assignee
    updatePromise = createIntakeAssignee(workspaceSlug, projectId, { user: val });

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
      {upgradePlan && (
        <PaidPlanUpgradeModal isOpen={isPaidPlanModalOpen} handleClose={() => togglePaidPlanModal(false)} />
      )}
      <h4 className="pt-4 mt-4 mb-2 text-sm font-medium text-custom-text-300">{intakeT("heading")}</h4>
      <div className="px-4 rounded border transition-all border-custom-border-200 bg-custom-background-90">
        {Object.entries(featureList).map(([featureKey, feature]) => (
          <div key={featureKey} className={cn("gap-y-3 gap-x-8 py-3 bg-custom-background-90")}>
            <div key={featureKey} className={cn("flex gap-2 justify-between", {})}>
              <div className="flex gap-2 w-full">
                <div
                  className={cn("flex justify-center rounded mt-1", {
                    "opacity-50": !isAdmin && upgradePlan,
                  })}
                >
                  {feature.icon}
                </div>
                <div className="w-full">
                  <div className={cn("flex gap-2 justify-between", {})}>
                    <div className="flex-1 w-full">
                      <div className="flex gap-2">
                        <div
                          className={cn("text-sm font-medium leading-5 align-top", {
                            "opacity-50": !isAdmin && upgradePlan,
                          })}
                        >
                          {intakeT(`${featureKey}.title`)}
                        </div>
                        {upgradePlan && (
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
                      <p
                        className={cn("text-sm text-custom-text-300 text-wrap mt-1", {
                          "opacity-50": !isAdmin && upgradePlan,
                        })}
                      >
                        {intakeT(`${featureKey}.description`)}
                      </p>
                    </div>
                    <div className="flex items-center h-8 max-w-40">
                      {upgradePlan ? (
                        <Tooltip
                          tooltipContent={`Ask your Workspace Admin to upgrade.`}
                          position="top"
                          className=""
                          disabled={isAdmin}
                        >
                          <div
                            onClick={() => {
                              if (!isAdmin) return;
                              togglePaidPlanModal(true);
                            }}
                          >
                            <MemberDropdown
                              value={assignee}
                              onChange={() => {}}
                              disabled={!isAdmin}
                              projectId={projectId}
                              placeholder={t("no_assignee")}
                              multiple={false}
                              showUserDetails
                              buttonVariant="border-with-text"
                              className={`w-full ${isAdmin ? "opacity-30" : ""}`}
                              buttonContainerClassName="w-full text-left"
                              buttonClassName={assignee ? "hover:bg-transparent" : ""}
                              dropdownArrow
                            />
                          </div>
                        </Tooltip>
                      ) : (
                        <MemberDropdown
                          value={assignee}
                          onChange={handleAssigneeChange}
                          disabled={!isAdmin}
                          projectId={projectId}
                          placeholder={t("no_assignee")}
                          multiple={false}
                          showUserDetails
                          buttonVariant="border-with-text"
                          className="w-full"
                          buttonContainerClassName="w-full text-left"
                          buttonClassName={assignee ? "hover:bg-transparent" : ""}
                          dropdownArrow
                        />
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
