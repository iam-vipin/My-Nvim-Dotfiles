import { Outlet } from "react-router";
import type { Route } from "./+types/layout";

export const meta: Route.MetaFunction = () => [{ name: "robots", content: "index, nofollow" }];

export default function OAuthLayout() {
  return <Outlet />;
}
