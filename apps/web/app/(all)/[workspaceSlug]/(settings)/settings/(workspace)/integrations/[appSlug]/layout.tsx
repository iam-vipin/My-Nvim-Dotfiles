"use client";
import Link from "next/link";

import { Outlet } from "react-router";
import { ChevronLeftIcon } from "lucide-react";
import type { Route } from "./+types/layout";

function IntegrationLayout({ params }: Route.ComponentProps) {
  const { workspaceSlug } = params;
  return (
    <div className="w-full h-full">
      <Link
        href={`/${workspaceSlug}/settings/integrations`}
        className="flex items-center gap-2 text-sm font-semibold text-custom-text-300 mb-6"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to integrations
      </Link>
      <Outlet />
    </div>
  );
}

export default IntegrationLayout;
