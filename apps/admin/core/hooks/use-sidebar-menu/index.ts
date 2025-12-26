// local imports
import { coreSidebarMenuLinks } from "./core";
import { extendedSidebarMenuLinks } from "./extended";
import type { TSidebarMenuItem } from "./types";

export function useSidebarMenu(): TSidebarMenuItem[] {
  return [
    coreSidebarMenuLinks.general,
    coreSidebarMenuLinks.email,
    coreSidebarMenuLinks.authentication,
    coreSidebarMenuLinks.workspace,
    extendedSidebarMenuLinks.billing,
    coreSidebarMenuLinks.ai,
    coreSidebarMenuLinks.image,
  ];
}
