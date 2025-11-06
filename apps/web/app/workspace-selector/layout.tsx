import { Outlet } from "react-router";
import type { Route } from "./+types/layout";

export const meta: Route.MetaFunction = () => [{ title: "Workspaces" }];

export default function WorkspacesLayout() {
  return <Outlet />;
}
