import { Link, Outlet } from "react-router";
import { ChevronLeftIcon } from "@plane/propel/icons";
import type { Route } from "./+types/layout";

export default function IdentityProvidersLayout(props: Route.ComponentProps) {
  const { workspaceSlug } = props.params;

  return (
    <div className="w-full h-full">
      <Link
        to={`/${workspaceSlug}/settings/identity/`}
        className="flex items-center gap-2 text-body-sm-medium text-secondary mb-6"
      >
        <ChevronLeftIcon className="size-4" />
        <div>Back to identity</div>
      </Link>
      <div className="pb-14">
        <Outlet />
      </div>
    </div>
  );
}
