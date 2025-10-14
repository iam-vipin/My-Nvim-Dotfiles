import { observer } from "mobx-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
// ce imports
import { AppSearch as BaseAppSearch } from "@/ce/components/workspace/sidebar/app-search";
// ui
import { SidebarSearchButton } from "@/components/sidebar/search-button";
// hooks
import { useInstance } from "@/hooks/store/use-instance";
// plane web imports
import { WithFeatureFlagHOC } from "@/plane-web/components/feature-flags";

export const AppSearch = observer(() => {
  // router
  const { workspaceSlug } = useParams();
  const pathname = usePathname();
  // derived values
  const isOnSearchPage = pathname.includes(`${workspaceSlug}/search`);
  const { config } = useInstance();

  if (!config?.is_opensearch_enabled) return <BaseAppSearch />;
  return (
    <WithFeatureFlagHOC workspaceSlug={workspaceSlug?.toString()} flag="ADVANCED_SEARCH" fallback={<BaseAppSearch />}>
      <Link href={`/${workspaceSlug}/search`}>
        <SidebarSearchButton isActive={isOnSearchPage} />
      </Link>
    </WithFeatureFlagHOC>
  );
});
