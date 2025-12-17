import type { FC } from "react";
import React from "react";
import type { LucideProps } from "lucide-react";
// ui
import { Tabs } from "@plane/ui";
// local components
import { SidebarWrapper } from "./sidebar-wrapper";

type TabItem = {
  key: string;
  icon?: FC<LucideProps>;
  label?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

type TSidebarRootProps = {
  isSidebarOpen: boolean;
  tabs: TabItem[];
  storageKey: string;
  defaultTab: string;
};

export function SidebarRoot(props: TSidebarRootProps) {
  const { isSidebarOpen, tabs, storageKey, defaultTab } = props;
  return (
    <SidebarWrapper isSidebarOpen={isSidebarOpen}>
      <Tabs
        tabs={tabs}
        storageKey={storageKey}
        defaultTab={defaultTab}
        containerClassName="gap-4"
        tabPanelClassName="h-full overflow-hidden"
      />
    </SidebarWrapper>
  );
}
