import { observer } from "mobx-react";
// ce imports
import { ProductUpdatesChangelog as ProductUpdatesChangelogCE } from "@/ce/components/global/product-updates/changelog";
// hooks
import { ProductUpdatesFallback } from "@/components/global/product-updates/fallback";
import { useInstance } from "@/hooks/store/use-instance";

export const ProductUpdatesChangelog = observer(function ProductUpdatesChangelog() {
  // store hooks
  const { config } = useInstance();

  if (config?.is_airgapped) {
    return (
      <ProductUpdatesFallback
        description="You’re using the airgapped version of Plane. Please visit our changelog to view the latest updates."
        variant="self-managed"
      />
    );
  }

  return <ProductUpdatesChangelogCE />;
});
