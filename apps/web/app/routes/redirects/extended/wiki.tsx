import { redirect } from "react-router";
import type { ClientLoaderFunctionArgs } from "react-router";

export const clientLoader = ({ params }: ClientLoaderFunctionArgs) => {
  const { workspaceSlug, "*": pathSplat } = params;
  const path = pathSplat || "";
  throw redirect(`/${workspaceSlug}/wiki/${path}`);
};

export default function WikiRedirect() {
  return null;
}
