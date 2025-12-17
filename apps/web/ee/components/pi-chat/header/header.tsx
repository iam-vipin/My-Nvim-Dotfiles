import { observer } from "mobx-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PanelLeft, SquarePen } from "lucide-react";
import { useTranslation } from "@plane/i18n";
// plane imports
import { HomeIcon, PiIcon } from "@plane/propel/icons";
import { Tooltip } from "@plane/propel/tooltip";
import { Breadcrumbs, Button, Header as HeaderUI } from "@plane/ui";
import { cn } from "@plane/utils";
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
import { AppHeader } from "@/components/core/app-header";
import { usePiChat } from "@/plane-web/hooks/store/use-pi-chat";
import { BetaBadge } from "../../common/beta";
import { ModelsDropdown } from "./models-dropdown";

type THeaderProps = {
  isProjectLevel?: boolean;
  shouldRenderSidebarToggle: boolean;
  isFullScreen: boolean;
  isSidePanelOpen: boolean;
  toggleSidePanel: (value: boolean) => void;
};

const buttonClass =
  "w-auto p-2 rounded-lg text-custom-text-200 grid place-items-center border-[0.5px] border-custom-sidebar-border-300 bg-custom-background-200 hover:shadow-sm hover:text-custom-text-300";
export const Header = observer(function Header(props: THeaderProps) {
  const router = useRouter();
  const { workspaceSlug } = useParams();
  const { isProjectLevel = false, isFullScreen, toggleSidePanel, isSidePanelOpen } = props;
  const { initPiChat, activeChatId, activeModel, models, setActiveModel } = usePiChat();
  const { t } = useTranslation();
  return (
    <AppHeader
      header={
        <HeaderUI>
          <HeaderUI.LeftItem className="flex items-center gap-2">
            <Breadcrumbs onBack={router.back}>
              {isProjectLevel && isFullScreen && (
                <Breadcrumbs.Item
                  component={
                    <BreadcrumbLink
                      href={"/"}
                      label={t("home.title")}
                      icon={<HomeIcon className="h-4 w-4 text-tertiary" />}
                    />
                  }
                />
              )}
              <Breadcrumbs.Item
                component={
                  <div className="flex rounded-sm gap-2 items-center">
                    {isFullScreen && <PiIcon className="size-4 text-icon-primary fill-current m-auto align-center" />}
                    {models?.length > 1 ? (
                      <ModelsDropdown
                        models={models}
                        activeModel={activeModel}
                        setActiveModel={(model) => setActiveModel(activeChatId, model)}
                      />
                    ) : (
                      <span className="text-body-xs-medium text-primary my-auto">Plane AI</span>
                    )}
                    <BetaBadge />
                  </div>
                }
              />
            </Breadcrumbs>
          </HeaderUI.LeftItem>
          <HeaderUI.RightItem>
            {isProjectLevel && (
              <div className="flex gap-2">
                <>
                  {!isFullScreen ? (
                    <Tooltip tooltipContent="Start a new chat" position="left">
                      <button
                        className="border border-subtle rounded-md shadow-raised-100 px-2 py-[0.5px] h-7 text-secondary"
                        onClick={() => initPiChat()}
                      >
                        <SquarePen className="flex-shrink-0 size-3.5" />
                      </button>
                    </Tooltip>
                  ) : (
                    <Tooltip tooltipContent="Start a new chat" position="bottom">
                      <Link
                        href={`/${workspaceSlug}/${isProjectLevel ? "projects/" : ""}pi-chat`}
                        tabIndex={-1}
                        className="border border-subtle rounded-md shadow-raised-100 px-2 py-[0.5px] h-7 text-secondary flex items-center justify-center"
                      >
                        <SquarePen className="flex-shrink-0 size-3.5" />
                      </Link>
                    </Tooltip>
                  )}
                  {!isSidePanelOpen && (
                    <Tooltip tooltipContent="History" position="bottom">
                      <button
                        type="button"
                        className="border border-subtle rounded-md shadow-raised-100 px-2 py-[0.5px] h-7 text-secondary"
                        onClick={() => toggleSidePanel(true)}
                      >
                        <PanelLeft className="size-3.5" />
                      </button>
                    </Tooltip>
                  )}
                </>
              </div>
            )}
          </HeaderUI.RightItem>
        </HeaderUI>
      }
    />
  );
});
