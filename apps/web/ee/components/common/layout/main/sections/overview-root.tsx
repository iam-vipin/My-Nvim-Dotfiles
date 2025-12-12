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
        <span className="text-base text-custom-text-300 font-medium">{title}</span>
      </div>
      <>{children}</>
    </SectionWrapper>
  );
}
