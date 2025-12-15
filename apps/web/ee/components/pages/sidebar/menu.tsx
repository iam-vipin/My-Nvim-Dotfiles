import { observer } from "mobx-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
// plane imports
import { EUserPermissionsLevel } from "@plane/constants";
import type { ISvgIcons } from "@plane/propel/icons";
import { HomeIcon } from "@plane/propel/icons";
import { EUserWorkspaceRoles } from "@plane/types";
// helpers
import { cn } from "@plane/utils";
// hooks
import { useUserPermissions } from "@/hooks/store/user";

export const SIDEBAR_MENU_ITEMS: {
  key: string;
  label: string;
  href: string;
  access: EUserWorkspaceRoles[];
  highlight: (pathname: string, baseUrl: string) => boolean;
  Icon: LucideIcon | React.FC<ISvgIcons>;
}[] = [
  {
    key: "home",
    label: "Home",
    href: `/wiki`,
    access: [EUserWorkspaceRoles.ADMIN, EUserWorkspaceRoles.MEMBER, EUserWorkspaceRoles.GUEST],
    highlight: (pathname: string, baseUrl: string) => pathname === `${baseUrl}`,
    Icon: HomeIcon,
  },
];

export const PagesAppSidebarMenu = observer(function PagesAppSidebarMenu() {
  // params
  const { workspaceSlug } = useParams();
  const pathname = usePathname();
  // store hooks
  const { allowPermissions } = useUserPermissions();

  return (
    <div className="w-full space-y-1">
      {SIDEBAR_MENU_ITEMS.map((link) => {
        if (!allowPermissions(link.access, EUserPermissionsLevel.WORKSPACE)) return null;

        return (
          <Link key={link.key} href={`/${workspaceSlug}${link.href}`} className="block">
            <div
              className={cn(
                "group w-full flex items-center gap-1.5 rounded-md px-2 py-1.5 outline-none text-secondary hover:bg-surface-2 focus:bg-surface-2",
                {
                  "text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/10 focus:bg-accent-primary/10":
                    link.highlight(pathname, `/${workspaceSlug}${link.href}/`),
                }
              )}
            >
              {<link.Icon className="size-4" />}
              <p className="text-13 leading-5 font-medium">{link.label}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
});
