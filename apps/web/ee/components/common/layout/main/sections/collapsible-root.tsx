import type { FC } from "react";
import React, { useMemo } from "react";
// ui
import { Collapsible, CollapsibleButton } from "@plane/ui";
// local components
import { SectionWrapper } from "../common/section-wrapper";

type TCollapsibleDetailSectionProps = {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  count: number;
  actionItemElement: React.ReactNode;
  collapsibleContent: React.ReactNode;
};

export function CollapsibleDetailSection(props: TCollapsibleDetailSectionProps) {
  const { title, actionItemElement, collapsibleContent, isOpen, count, onToggle } = props;

  const collapsibleButton = useMemo(
    () => (
      <CollapsibleButton
        isOpen={isOpen}
        title={title}
        titleClassName="font-medium text-tertiary text-14"
        indicatorElement={
          count > 0 && (
            <span className="flex items-center justify-center ">
              <p className="text-14 text-tertiary !leading-3">{count}</p>
            </span>
          )
        }
        actionItemElement={actionItemElement}
        className="border-none py-0 h-min"
      />
    ),
    [actionItemElement, count, isOpen, title]
  );

  return (
    <SectionWrapper>
      <Collapsible isOpen={isOpen} onToggle={onToggle} title={collapsibleButton} buttonClassName="w-full">
        {collapsibleContent}
      </Collapsible>
    </SectionWrapper>
  );
}
