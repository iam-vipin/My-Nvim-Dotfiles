import type { FC } from "react";
import React from "react";
// local components
import { SectionWrapper } from "../common/section-wrapper";

type TOverviewSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function OverviewSection(props: TOverviewSectionProps) {
  const { children, title } = props;
  return (
    <SectionWrapper>
      <div className="flex items-center">
        <span className="text-14 text-tertiary font-medium">{title}</span>
      </div>
      <>{children}</>
    </SectionWrapper>
  );
}
