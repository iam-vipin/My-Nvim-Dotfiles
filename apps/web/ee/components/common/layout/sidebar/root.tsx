import type { FC } from "react";
import React from "react";
import type { LucideProps } from "lucide-react";

// local components
import { useLocalStorage } from "@plane/hooks";
import { Tabs } from "@plane/propel/tabs";
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
  const { storedValue, setValue } = useLocalStorage(storageKey, defaultTab);

  return (
    <SidebarWrapper isSidebarOpen={isSidebarOpen}>
      <Tabs defaultValue={storedValue ?? defaultTab} onValueChange={setValue}>
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Trigger key={tab.key} value={tab.key}>
              {tab.icon && <tab.icon className="size-4" />}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <div className="mt-4">
          {tabs.map((tab) => (
            <Tabs.Content key={tab.key} value={tab.key}>
              {tab.content}
            </Tabs.Content>
          ))}
        </div>
      </Tabs>
    </SidebarWrapper>
  );
}
