import { observer } from "mobx-react";
import Link from "next/link";
import { useTheme } from "next-themes";
// plane imports
import { useTranslation } from "@plane/i18n";
import { getButtonStyling } from "@plane/propel/button";
import { cn } from "@plane/utils";
// assets
import emptyWorkspaceDarkPng from "@/app/assets/empty-state/marketplace/empty-workspace-dark.png?url";
import emptyWorkspaceLightPng from "@/app/assets/empty-state/marketplace/empty-workspace-light.png?url";

export const WorkspaceSelectorEmptyState = observer(function WorkspaceSelectorEmptyState() {
  // plane hooks
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  // derived values
  const image = resolvedTheme === "light" ? emptyWorkspaceLightPng : emptyWorkspaceDarkPng;

  return (
    <div className="relative flex flex-col gap-4 h-full w-full justify-center px-8 pb-8 items-center">
      <div className="text-3xl font-bold text-center">{t("no_workspaces_to_connect")}</div>
      <div className="font-medium text-custom-text-300 max-w-[450px] text-center">
        {t("no_workspaces_to_connect_description")}
      </div>
      <div className="overflow-y-auto vertical-scrollbar scrollbar-sm mb-10 w-full md:w-fit">
        <div className="w-full flex flex-col gap-2 items-center md:w-[450px]">
          <img src={image} alt="empty workspace" width={384} height={250} />
          <div className="flex gap-2 flex-col md:flex-row">
            <a
              href="https://docs.plane.so/core-concepts/workspaces/overview"
              target="_blank"
              className={cn(getButtonStyling("outline-primary", "md"), "border-custom-border-200 text-custom-text-100")}
              rel="noreferrer"
            >
              {t("learn_more_about_workspaces")}
            </a>
            <Link
              href="/create-workspace"
              className={cn("text-sm text-custom-text-300 w-full", getButtonStyling("primary", "md"))}
            >
              {t("create_a_new_workspace")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});
