import { CreditCard, Users } from "lucide-react";
// types
import type { TSidebarMenuItem } from "./types";

export type TExtendedSidebarMenuKey = "billing" | "user-management";

export const extendedSidebarMenuLinks: Record<TExtendedSidebarMenuKey, TSidebarMenuItem> = {
  billing: {
    Icon: CreditCard,
    name: "Billing",
    description: "Active plans",
    href: `/billing/`,
  },
  "user-management": {
    Icon: Users,
    name: "User Management",
    description: "Instance user management",
    href: `/user-management/`,
  },
};
