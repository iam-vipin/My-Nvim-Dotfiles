import { useTheme } from "next-themes";
// plane imports
import { useTranslation } from "@plane/i18n";
// assets
import assetsDark from "@/app/assets/empty-state/wiki/navigation-pane/assets-dark.webp?url";
import assetsLight from "@/app/assets/empty-state/wiki/navigation-pane/assets-light.webp?url";

export const PageNavigationPaneAssetsTabEmptyState = () => {
  // theme hook
  const { resolvedTheme } = useTheme();
  // asset resolved path
  const resolvedPath = resolvedTheme === "light" ? assetsLight : assetsDark;
  // translation
  const { t } = useTranslation();

  return (
    <div className="size-full grid place-items-center">
      <div className="flex flex-col items-center gap-y-6 text-center">
        <img
          src={resolvedPath}
          width={160}
          height={160}
          alt="An image depicting the assets of a page"
          className="w-full h-full object-cover"
        />
        <div className="space-y-2.5">
          <h4 className="text-base font-medium">{t("page_navigation_pane.tabs.assets.empty_state.title")}</h4>
          <p className="text-sm text-custom-text-200 font-medium">
            {t("page_navigation_pane.tabs.assets.empty_state.description")}
          </p>
        </div>
      </div>
    </div>
  );
};
