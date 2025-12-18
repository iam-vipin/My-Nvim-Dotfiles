import { observer } from "mobx-react";
import { Logo } from "@plane/propel/emoji-icon-picker";
import { PageIcon } from "@plane/propel/icons";
// plane imports
import { Tooltip } from "@plane/ui";
import { getPageName } from "@plane/utils";
// components
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
// hooks
import { usePlatformOS } from "@/hooks/use-platform-os";
// plane web hooks
import type { EPageStoreType } from "@/plane-web/hooks/store";
import { usePage } from "@/plane-web/hooks/store";

export interface IPageBreadcrumbProps {
  pageId: string;
  storeType: EPageStoreType;
  href?: string;
  showLogo?: boolean;
  isEditable?: boolean;
}

export const PageBreadcrumbItem = observer(function PageBreadcrumbItem({
  pageId,
  storeType,
  href,
  showLogo = true,
}: IPageBreadcrumbProps) {
  // hooks
  const { isMobile } = usePlatformOS();
  const page = usePage({
    pageId: pageId,
    storeType: storeType,
  });

  const { name, logo_props } = page ?? {};

  // Show loading state when the page data isn't available yet
  if (!page) {
    const loadingItemClasses = href ? "" : "flex items-center space-x-2";

    if (href) {
      return (
        <div className="flex items-center gap-1 font-medium text-13 text-secondary">
          {showLogo && <div className="h-4 w-4 bg-layer-1 rounded animate-pulse" />}
          <div className="h-4 w-24 bg-layer-1 rounded animate-pulse" />
        </div>
      );
    }

    return (
      <li className={loadingItemClasses} tabIndex={-1}>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex cursor-default items-center gap-1 text-13 font-medium text-primary">
            {showLogo && <div className="h-5 w-5 bg-layer-1 rounded animate-pulse" />}
            <div className="h-4 w-24 bg-layer-1 rounded animate-pulse" />
          </div>
        </div>
      </li>
    );
  }

  if (href) {
    return (
      <BreadcrumbLink
        href={href}
        label={getPageName(name)}
        icon={
          showLogo && (
            <>
              {logo_props?.in_use ? (
                <Logo logo={logo_props} size={16} type="lucide" />
              ) : (
                <PageIcon className="size-4 text-tertiary" />
              )}
            </>
          )
        }
      />
    );
  }

  return (
    <li className="flex items-center space-x-2" tabIndex={-1}>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex cursor-default items-center gap-1 text-13 font-medium text-primary">
          {showLogo && (
            <>
              {logo_props?.in_use ? (
                <Logo logo={logo_props} size={16} type="lucide" />
              ) : (
                <PageIcon className="size-4 text-tertiary" />
              )}
            </>
          )}
          <Tooltip tooltipContent={getPageName(name)} position="bottom" isMobile={isMobile}>
            <div className="relative line-clamp-1 block max-w-[150px] overflow-hidden truncate">
              {getPageName(name)}
            </div>
          </Tooltip>
        </div>
      </div>
    </li>
  );
});
