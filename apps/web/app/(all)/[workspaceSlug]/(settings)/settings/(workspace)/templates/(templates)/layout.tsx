import { observer } from "mobx-react";
import Link from "next/link";
import { Outlet } from "react-router";
import { ChevronLeftIcon } from "lucide-react";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import type { Route } from "./+types/layout";

function TemplatesLayout({ params }: Route.ComponentProps) {
  // router params
  const { workspaceSlug } = params;

  return (
    <SettingsContentWrapper>
      <div className="w-full h-full">
        <Link
          href={`/${workspaceSlug}/settings/templates`}
          className="flex items-center gap-2 text-sm font-semibold text-custom-text-300 mb-6"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back to templates
        </Link>
        <Outlet />
      </div>
    </SettingsContentWrapper>
  );
}

export default observer(TemplatesLayout);
