import { observer } from "mobx-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { ScopeIcon } from "@plane/propel/icons";
import { Button, CircularProgressIndicator, ControlLink, Loader } from "@plane/ui";
// plane web imports
import { SectionEmptyState } from "@/plane-web/components/common/layout/main/common/empty-state";
import { SectionWrapper } from "@/plane-web/components/common/layout/main/common/section-wrapper";
import { AddScopeButton } from "@/plane-web/components/initiatives/common/add-scope-button";
import { UpdateStatusPills } from "@/plane-web/components/initiatives/common/update-status";
import { useInitiativeUpdates } from "@/plane-web/components/initiatives/details/sidebar/use-updates";
import { useInitiatives } from "@/plane-web/hooks/store/use-initiatives";
import type { TInitiativeAnalyticData } from "@/plane-web/types/initiative";

type TDataCardProps = {
  workspaceSlug: string;
  initiativeId: string;
  type: "project" | "epic";
  data: TInitiativeAnalyticData | undefined;
  onAdd: (value?: boolean) => void;
  count: number;
};

const DataCard = (props: TDataCardProps) => {
  const { type, data, workspaceSlug, initiativeId, count } = props;
  const router = useRouter();
  const { handleUpdateOperations } = useInitiativeUpdates(workspaceSlug, initiativeId);
  const total =
    (data?.backlog_issues ?? 0) +
    (data?.unstarted_issues ?? 0) +
    (data?.started_issues ?? 0) +
    (data?.completed_issues ?? 0) +
    (data?.cancelled_issues ?? 0);
  const completed = (data?.completed_issues ?? 0) + (data?.cancelled_issues ?? 0);
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleControlLinkClick = () => {
    router.push(`/${workspaceSlug}/initiatives/${initiativeId}/scope`);
  };
  return (
    <ControlLink
      href={`/${workspaceSlug}/initiatives/${initiativeId}/scope`}
      className="group rounded-md py-3 px-4 w-full hover:cursor-pointer hover:bg-custom-background-80 transition-colors flex justify-between border border-custom-border-100 bg-custom-background-100"
      onClick={handleControlLinkClick}
    >
      <div className="flex w-full justify-between text-custom-text-300 flex-1 ">
        <div className="flex gap-2 items-center">
          <div className="font-semibold text-base capitalize">{type}s</div>
          <span className="text-custom-text-400 font-medium text-xs">{count}</span>
        </div>
      </div>
      {data ? (
        <div className="rounded-md flex gap-3 justify-between items-center">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <CircularProgressIndicator
                percentage={progress}
                strokeWidth={4}
                size={18}
                strokeColor="stroke-green-500"
              />
              <span className="flex items-baseline text-custom-text-200 justify-center text-sm">
                <span>{progress}%</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div role="group" aria-label="update-status-pills">
              <UpdateStatusPills
                defaultTab={type}
                handleUpdateOperations={handleUpdateOperations}
                workspaceSlug={workspaceSlug.toString()}
                initiativeId={initiativeId}
                analytics={{
                  on_track_updates: data?.on_track_updates ?? 0,
                  at_risk_updates: data?.at_risk_updates ?? 0,
                  off_track_updates: data?.off_track_updates ?? 0,
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-md flex gap-3 justify-between items-center">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <Loader>
                <Loader.Item height="18px" width="18px" />
              </Loader>
              <Loader>
                <Loader.Item height="14px" width="40px" />
              </Loader>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Loader>
              <Loader.Item height="20px" width="120px" />
            </Loader>
          </div>
        </div>
      )}
    </ControlLink>
  );
};

type Props = {
  workspaceSlug: string;
  initiativeId: string;
  disabled?: boolean;
};
export const ScopeBreakdown = observer((props: Props) => {
  const { workspaceSlug, initiativeId, disabled } = props;
  const {
    initiative: {
      getInitiativeAnalyticsById,
      getInitiativeById,
      epics: { getInitiativeEpicsById },
      toggleProjectsModal,
      toggleEpicModal,
    },
  } = useInitiatives();

  const { t } = useTranslation();

  // derived values
  const initiativeAnalytics = getInitiativeAnalyticsById(initiativeId);
  const initiative = getInitiativeById(initiativeId);
  const initiativeEpics = getInitiativeEpicsById(initiativeId);

  const epicsCount = initiativeEpics?.length ?? 0;
  const projectsCount = initiative?.project_ids?.length ?? 0;

  const shouldShowProjectsCard = projectsCount > 0;
  const shouldShowEpicsCard = epicsCount > 0;

  if (!initiative) return null;

  return (
    <SectionWrapper className="flex-col gap-4 @container">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-custom-text-300 font-semibold text-base">{t("initiatives.scope.breakdown")}</div>
        {/* button */}
        <div className="flex gap-2 items-center">
          <Link
            href={`/${workspaceSlug}/initiatives/${initiativeId}/scope`}
            className=" font-medium text-sm text-custom-text-200"
          >
            {t("initiatives.scope.view_scope")}
          </Link>
          <AddScopeButton
            disabled={disabled}
            customButton={
              <Button
                variant="link-neutral"
                size="sm"
                className="!p-1 bg-custom-background-80 hover:bg-custom-background-90"
              >
                <PlusIcon className="size-4" />
              </Button>
            }
          />
        </div>
      </div>
      {/* content */}
      {!shouldShowProjectsCard && !shouldShowEpicsCard ? (
        <SectionEmptyState
          heading={t("initiatives.scope.empty_state.title")}
          subHeading={t("initiatives.scope.empty_state.description")}
          icon={<ScopeIcon className="size-4" />}
          actionElement={<AddScopeButton disabled={disabled} />}
        />
      ) : (
        <div className="grid w-full grid-cols-1 @sm:grid-cols-1 bg-custom-background-90 rounded-lg p-2 gap-2">
          {/* Projects */}
          {shouldShowProjectsCard && (
            <DataCard
              workspaceSlug={workspaceSlug}
              initiativeId={initiativeId}
              type="project"
              onAdd={toggleProjectsModal}
              data={initiativeAnalytics?.project}
              count={projectsCount}
            />
          )}
          {/* Epics */}
          {shouldShowEpicsCard && (
            <DataCard
              workspaceSlug={workspaceSlug}
              initiativeId={initiativeId}
              type="epic"
              onAdd={toggleEpicModal}
              data={initiativeAnalytics?.epic}
              count={epicsCount}
            />
          )}
        </div>
      )}
    </SectionWrapper>
  );
});
