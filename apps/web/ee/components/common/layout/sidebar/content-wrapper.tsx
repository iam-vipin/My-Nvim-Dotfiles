import type { FC, ReactNode } from "react";

type TSidebarContentWrapperProps = {
  title?: string;
  children: ReactNode;
  actionElement?: ReactNode;
};

export function SidebarContentWrapper(props: TSidebarContentWrapperProps) {
  const { title, children, actionElement } = props;
  return (
    <div className="flex items-center h-full w-full flex-col divide-y-2 divide-subtle-1 overflow-hidden">
      <div className="flex flex-col gap-4 h-full w-full overflow-y-auto">
        {(title || actionElement) && (
          <div className="flex items-center justify-between gap-2 ">
            {title && <h5 className="text-16 font-semibold text-secondary">{title}</h5>}
            {actionElement}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
