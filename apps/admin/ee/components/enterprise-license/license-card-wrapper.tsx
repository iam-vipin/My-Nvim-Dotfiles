import type { ReactNode } from "react";

type TLicenseCardWrapperProps = {
  children: ReactNode;
  description: ReactNode;
};

export function LicenseCardWrapper(props: TLicenseCardWrapperProps) {
  const { children, description } = props;

  return (
    <div className="rounded-lg border border-subtle bg-layer-1 p-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-body-sm-semibold text-primary">Activate Enterprise license</h3>
          <div className="space-y-1 text-body-sm-regular text-secondary">{description}</div>
        </div>
        {children}
      </div>
    </div>
  );
}
