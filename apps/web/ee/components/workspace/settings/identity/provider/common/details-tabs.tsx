// plane imports
import { Tabs } from "@plane/propel/tabs";
import { cn } from "@plane/utils";

type TTab<TKey extends string> = {
  key: TKey;
  label: string;
  content: React.ReactNode;
};

type TProviderDetailsTabsProps<TKey extends string> = {
  tabs: readonly TTab<TKey>[];
};

export function ProviderDetailsTabs<TKey extends string>(props: TProviderDetailsTabsProps<TKey>) {
  const { tabs } = props;
  const firstTabKey = tabs[0]?.key;
  // derived values
  const hasMultipleTabs = tabs.length > 1;

  if (!firstTabKey) {
    return null;
  }

  return (
    <Tabs defaultValue={firstTabKey}>
      {hasMultipleTabs ? (
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Trigger key={tab.key} value={tab.key}>
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      ) : null}
      {tabs.map((tab) => (
        <Tabs.Content key={tab.key} value={tab.key}>
          {tab.content}
        </Tabs.Content>
      ))}
    </Tabs>
  );
}
