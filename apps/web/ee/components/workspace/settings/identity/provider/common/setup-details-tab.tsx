import type { ReactNode } from "react";

type TProviderSetupDetailsTabProps = {
  title: string;
  children: ReactNode;
};

export function ProviderSetupDetailsTab(props: TProviderSetupDetailsTabProps) {
  const { title, children } = props;

  return (
    <>
      <h5 className="text-body-xs-medium text-secondary bg-layer-1-selected p-3 rounded-t-lg">{title}</h5>
      <div className="p-3 bg-layer-1 rounded-b-lg flex flex-col gap-y-4">{children}</div>
    </>
  );
}
