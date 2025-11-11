import { observer } from "mobx-react";
import { Outlet } from "react-router";
import type { ShouldRevalidateFunctionArgs } from "react-router";
import useSWR from "swr";
// components
import { LogoSpinner } from "@/components/common/logo-spinner";
import { SomethingWentWrongError } from "@/components/issues/issue-layouts/error";
// hooks
import { PageNotFound } from "@/components/ui/not-found";
import { usePublish, usePublishList } from "@/hooks/store/publish";
import type { Route } from "./+types/layout";

const DEFAULT_TITLE = "Plane";
const DEFAULT_DESCRIPTION = "Made with Plane, an AI-powered work management platform with publishing capabilities.";

interface IntakeMetadata {
  name?: string;
  description?: string;
  cover_image?: string;
}

// Loader function runs on the server and fetches metadata
export async function loader({ params }: Route.LoaderArgs) {
  const { anchor } = params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/public/anchor/${anchor}/intake/meta/`);

    if (!response.ok) {
      return { metadata: null };
    }

    const metadata: IntakeMetadata = await response.json();
    return { metadata };
  } catch (error) {
    console.error("Error fetching intake metadata:", error);
    return { metadata: null };
  }
}

// Meta function uses the loader data to generate metadata
export function meta({ loaderData }: Route.MetaArgs) {
  const metadata = loaderData?.metadata;

  const title = metadata?.name ? `${metadata.name} - Intake` : `${DEFAULT_TITLE} - Intake`;
  const description = metadata?.description || DEFAULT_DESCRIPTION;
  const coverImage = metadata?.cover_image;

  const metaTags = [
    { title },
    { name: "description", content: description },
    // OpenGraph metadata
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    // Twitter metadata
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];

  // Add images if cover image exists
  if (coverImage) {
    metaTags.push(
      { property: "og:image", content: coverImage },
      { property: "og:image:width", content: "800" },
      { property: "og:image:height", content: "600" },
      { property: "og:image:alt", content: metadata?.name || DEFAULT_TITLE },
      { name: "twitter:image", content: coverImage }
    );
  }

  return metaTags;
}

// Prevent loader from re-running on anchor param changes
export function shouldRevalidate({ currentParams, nextParams }: ShouldRevalidateFunctionArgs) {
  return currentParams.anchor !== nextParams.anchor;
}

function IntakeLayout(props: Route.ComponentProps) {
  const { anchor } = props.params;
  // store hooks
  const { fetchPublishSettings } = usePublishList();
  const publishSettings = usePublish(anchor);

  // fetch publish settings && view details
  const { error } = useSWR(
    anchor ? `PUBLISHED_VIEW_SETTINGS_${anchor}` : null,
    anchor
      ? async () => {
          const promises = [];
          promises.push(fetchPublishSettings(anchor));
          await Promise.all(promises);
        }
      : null
  );

  if (error?.status === 404) return <PageNotFound />;

  if (error) return <SomethingWentWrongError />;

  if (!publishSettings)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LogoSpinner />
      </div>
    );

  return (
    <div className="relative flex h-screen min-h-[500px] w-screen flex-col overflow-hidden">
      <div className="relative h-full w-full overflow-hidden bg-custom-primary-100/5 flex">
        <Outlet />
      </div>
    </div>
  );
}

export default observer(IntakeLayout);
